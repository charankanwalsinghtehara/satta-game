
from decimal import Decimal

from django.contrib.auth import get_user_model, password_validation
from django.utils import timezone
from rest_framework import serializers

from .models import (
    Achievement,
    Asset,
    GameMode,
    GameRound,
    LedgerEntry,
    MarketEvent,
    Mission,
    PriceSnapshot,
    Trade,
    UserAchievement,
    UserMission,
    AuctionLot,
    AuctionBid,
)

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_username(self, value):
        value = value.strip().lower()
        if not value:
            raise serializers.ValidationError("Username cannot be empty.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value.lower()

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    xp = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined",
            "xp",
            "level",
        ]
        read_only_fields = ["id", "username", "date_joined"]

    def validate_email(self, value):
        exists = (
            User.objects.filter(email__iexact=value)
            .exclude(pk=self.instance.pk)
            .exists()
        )
        if exists:
            raise serializers.ValidationError("This email is already registered.")
        return value.lower()

    def get_xp(self, user):
        return sum(
            user.userachievement_set.select_related("achievement").values_list(
                "achievement__xp_reward", flat=True
            )
        )

    def get_level(self, user):
        return 1 + self.get_xp(user) // 100


class PublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "date_joined"]


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            "symbol",
            "name",
            "description",
            "category",
            "current_price",
            "volatility",
            "min_price",
            "max_price",
            "is_active",
            "version",
            "updated_at",
        ]


class PriceSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceSnapshot
        fields = ["price", "version", "created_at"]


class LedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = [
            "id",
            "kind",
            "delta",
            "balance_after",
            "reason",
            "created_at",
        ]


class TradeSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="asset.symbol", read_only=True)

    class Meta:
        model = Trade
        fields = [
            "id",
            "symbol",
            "side",
            "quantity",
            "price",
            "gross_amount",
            "fee",
            "realized_pnl",
            "created_at",
        ]


class TradeRequestSerializer(serializers.Serializer):
    symbol = serializers.RegexField(r"^[A-Za-z0-9]{2,12}$", max_length=12)
    quantity = serializers.DecimalField(
        max_digits=14,
        decimal_places=4,
        min_value=Decimal("0.0001"),
    )
    idempotency_key = serializers.CharField(max_length=100)
    language = serializers.ChoiceField(
        choices=[("hinglish", "Hinglish"), ("en", "English")],
        required=False,
        default="hinglish",
    )


class EventSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="template.name", read_only=True)
    commentary = serializers.CharField(source="template.commentary", read_only=True)

    class Meta:
        model = MarketEvent
        fields = [
            "id",
            "name",
            "commentary",
            "effects",
            "starts_at",
            "ends_at",
            "round",
        ]


class GameModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameMode
        fields = [
            "slug",
            "name",
            "duration_seconds",
            "description",
            "is_active",
        ]


class RoundSerializer(serializers.ModelSerializer):
    mode = serializers.CharField(source="mode.name", read_only=True)

    class Meta:
        model = GameRound
        fields = [
            "id",
            "mode",
            "status",
            "starts_at",
            "ends_at",
            "summary",
        ]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["code", "name", "description", "xp_reward"]


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ["achievement", "awarded_at"]


class MissionSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    completed = serializers.SerializerMethodField()
    claimed_at = serializers.SerializerMethodField()

    class Meta:
        model = Mission
        fields = [
            "code",
            "name",
            "description",
            "target",
            "reward",
            "progress",
            "completed",
            "claimed_at",
        ]

    def _assignment(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None

        return UserMission.objects.filter(
            user=request.user,
            mission=obj,
        ).first()

    def get_progress(self, obj):
        assignment = self._assignment(obj)
        return assignment.progress if assignment else 0

    def get_completed(self, obj):
        assignment = self._assignment(obj)
        return bool(assignment and assignment.progress >= obj.target)

    def get_claimed_at(self, obj):
        assignment = self._assignment(obj)
        return assignment.claimed_at if assignment else None


def active_missions():
    now = timezone.now()
    return Mission.objects.filter(
        is_active=True,
        active_from__lte=now,
        active_until__gt=now,
    )


class AuctionLotSerializer(serializers.ModelSerializer):
    highest_bidder = serializers.CharField(
        source="highest_bidder.username",
        read_only=True,
        allow_null=True,
    )

    winner = serializers.CharField(
        source="winner.username",
        read_only=True,
        allow_null=True,
    )

    bid_count = serializers.SerializerMethodField()
    minimum_next_bid = serializers.SerializerMethodField()

    class Meta:
        model = AuctionLot
        fields = [
            "id",
            "item_code",
            "name",
            "description",
            "category",
            "emoji",
            "starting_price",
            "current_bid",
            "minimum_increment",
            "minimum_next_bid",
            "highest_bidder",
            "winner",
            "bid_count",
            "starts_at",
            "ends_at",
            "status",
        ]

    def get_bid_count(self, obj):
        return obj.bids.count()

    def get_minimum_next_bid(self, obj):
        if obj.current_bid <= 0:
            return obj.starting_price

        return obj.current_bid + obj.minimum_increment


class AuctionBidSerializer(serializers.ModelSerializer):
    bidder = serializers.CharField(
        source="bidder.username",
        read_only=True,
    )

    class Meta:
        model = AuctionBid
        fields = [
            "id",
            "bidder",
            "amount",
            "created_at",
        ]


class AuctionBidRequestSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    idempotency_key = serializers.CharField(max_length=100)

    def validate(self, attrs):
        request = self.context.get("request")
        lot = self.context.get("lot")

        if lot is None:
            raise serializers.ValidationError("Auction lot is required.")

        if lot.status != "active":
            raise serializers.ValidationError("This auction is not active.")

        now = timezone.now()
        if lot.starts_at and now < lot.starts_at:
            raise serializers.ValidationError("This auction has not started.")

        if lot.ends_at and now >= lot.ends_at:
            raise serializers.ValidationError("This auction has ended.")

        minimum = (
            lot.starting_price
            if lot.current_bid <= 0
            else lot.current_bid + lot.minimum_increment
        )

        if attrs["amount"] < minimum:
            raise serializers.ValidationError({
                "amount": f"Your bid must be at least {minimum}."
            })

        if request and request.user.is_authenticated:
            if lot.highest_bidder_id == request.user.id:
                raise serializers.ValidationError(
                    "You already hold the highest bid."
                )

        return attrs


def place_auction_bid(*args, **kwargs):
    """
    Compatibility placeholder.

    The correct auction bidding operation must use the actual
    transaction and wallet logic from views.py/services.py.

    This function deliberately raises an error rather than silently
    accepting bids without updating the auction and wallet safely.
    """
    raise NotImplementedError(
        "Connect place_auction_bid to the project's auction bidding service."
    )
