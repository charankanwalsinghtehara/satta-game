
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.game.models import (
    AuctionLot,
    AuctionBid,
    Wallet,
    LedgerEntry,
    MarketSettings,
)
from apps.game.services import _write_ledger


class Command(BaseCommand):
    help = "Reset the auction catalogue and refund existing leading bids."

    @transaction.atomic
    def handle(self, *args, **options):
        lots = list(
            AuctionLot.objects.select_for_update().select_related(
                "highest_bidder"
            )
        )

        refunded = 0

        # Refund the amount held from every current leader.
        for lot in lots:
            if not lot.highest_bidder_id or lot.current_bid <= 0:
                continue

            wallet, _ = Wallet.objects.get_or_create(
                user_id=lot.highest_bidder_id,
                defaults={
                    "balance": MarketSettings.current().starting_balance
                },
            )

            wallet = Wallet.objects.select_for_update().get(
                pk=wallet.pk
            )

            _write_ledger(
                wallet,
                LedgerEntry.Kind.AUCTION_REFUND,
                lot.current_bid,
                f"Catalogue reset refund: {lot.name}",
                f"auction-catalog-reset:{lot.pk}",
            )

            refunded += 1

        # Remove old bid history before deleting lots because
        # AuctionBid uses PROTECT on its lot relationship.
        AuctionBid.objects.all().delete()
        AuctionLot.objects.all().delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Auction catalogue reset. "
                f"{len(lots)} old lots removed. "
                f"{refunded} leading bids refunded."
            )
        )
