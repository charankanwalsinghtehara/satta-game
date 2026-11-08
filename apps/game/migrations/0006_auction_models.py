from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0005_alter_ledgerentry_idempotency_key_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AuctionLot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("item_code", models.SlugField(max_length=60, unique=True)),
                ("name", models.CharField(max_length=120)),
                ("description", models.TextField()),
                ("category", models.CharField(default="Entertainment", max_length=60)),
                ("emoji", models.CharField(default="🎭", max_length=12)),
                ("starting_price", models.DecimalField(decimal_places=2, max_digits=14, validators=[django.core.validators.MinValueValidator(1)])),
                ("current_bid", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("minimum_increment", models.DecimalField(decimal_places=2, default=50, max_digits=12, validators=[django.core.validators.MinValueValidator(1)])),
                ("starts_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("ends_at", models.DateTimeField()),
                ("status", models.CharField(choices=[("upcoming", "Upcoming"), ("live", "Live"), ("sold", "Sold"), ("unsold", "Unsold")], db_index=True, default="upcoming", max_length=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("highest_bidder", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="leading_auctions", to=settings.AUTH_USER_MODEL)),
                ("winner", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="auction_wins", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["starts_at"],
            },
        ),
        migrations.CreateModel(
            name="AuctionBid",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(decimal_places=2, max_digits=14, validators=[django.core.validators.MinValueValidator(1)])),
                ("idempotency_key", models.CharField(max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("bidder", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="auction_bids", to=settings.AUTH_USER_MODEL)),
                ("lot", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="bids", to="game.auctionlot")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="auctionlot",
            constraint=models.CheckConstraint(condition=models.Q(("starting_price__gt", 0)), name="auction_start_price_positive"),
        ),
        migrations.AddConstraint(
            model_name="auctionlot",
            constraint=models.CheckConstraint(condition=models.Q(("current_bid__gte", 0)), name="auction_current_bid_nonnegative"),
        ),
        migrations.AddConstraint(
            model_name="auctionlot",
            constraint=models.CheckConstraint(condition=models.Q(("minimum_increment__gt", 0)), name="auction_increment_positive"),
        ),
        migrations.AddConstraint(
            model_name="auctionlot",
            constraint=models.CheckConstraint(condition=models.Q(("ends_at__gt", models.F("starts_at"))), name="auction_end_after_start"),
        ),
        migrations.AddConstraint(
            model_name="auctionbid",
            constraint=models.CheckConstraint(condition=models.Q(("amount__gt", 0)), name="auction_bid_amount_positive"),
        ),
        migrations.AddConstraint(
            model_name="auctionbid",
            constraint=models.UniqueConstraint(fields=("bidder", "idempotency_key"), name="unique_auction_bid_request"),
        ),
    ]
