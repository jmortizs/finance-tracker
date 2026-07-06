from __future__ import annotations

from dataclasses import dataclass

from pydantic_ai import Agent, RunContext

from app.repositories.finance_repo import FinanceRepository
from app.schemas.statement_ingestion import StatementExtraction


@dataclass
class StatementAgentDependencies:
    repository: FinanceRepository


def build_statement_agent(
    model_name: str,
) -> Agent[StatementAgentDependencies, StatementExtraction]:
    agent = Agent(
        f"openai:{model_name}",
        deps_type=StatementAgentDependencies,
        output_type=StatementExtraction,
        instructions=(
            "You extract bank statement data for a local personal finance dashboard. "
            "Your input is plain text deterministically extracted from a PDF with its "
            "two-dimensional layout preserved: spacing and column alignment mirror the original "
            "document, and pages are separated by '--- PAGE n ---' markers. Act as a parser of "
            "this pre-extracted spatial text: map each tabular row to exactly one transaction "
            "using the preserved column alignment to associate dates, descriptions, amounts, and "
            "balances. Never invent values that are not present in the text. "
            "Return only structured data matching the output schema. Use positive amounts for "
            "income and expenses, classify each transaction as INCOME or EXPENSE, and use the "
            "database tools to map known banks, accounts, and categories. Default all currencies "
            "to COP unless the statement explicitly states another ISO 4217 currency. The final "
            "statement balances must satisfy final_balance = initial_balance + total_income - "
            "total_expenses."
        ),
    )

    @agent.tool
    async def list_categories(
        ctx: RunContext[StatementAgentDependencies],
    ) -> list[dict[str, str | int]]:
        """Return categories available for transaction classification."""
        return [
            {"id": category.id, "name": category.name, "type": category.type.value}
            for category in ctx.deps.repository.list_categories()
        ]

    @agent.tool
    async def list_banks(ctx: RunContext[StatementAgentDependencies]) -> list[dict[str, str | int]]:
        """Return banks available for statement bank mapping."""
        return [{"id": bank.id, "name": bank.name} for bank in ctx.deps.repository.list_banks()]

    @agent.tool
    async def list_accounts(
        ctx: RunContext[StatementAgentDependencies],
    ) -> list[dict[str, str | int]]:
        """Return accounts available for statement account mapping."""
        return [
            {
                "id": account.id,
                "bank_id": account.bank_id,
                "name": account.name,
                "account_number": account.account_number,
                "currency": account.currency,
            }
            for account in ctx.deps.repository.list_accounts()
        ]

    return agent
