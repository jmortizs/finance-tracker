from pydantic_ai import Agent

from app.schemas.credit_card import CreditCardStatementExtraction


def build_credit_card_agent(model_name: str) -> Agent[None, CreditCardStatementExtraction]:
    return Agent(
        f"openai:{model_name}",
        output_type=CreditCardStatementExtraction,
        instructions=(
            "Extract one credit-card statement into the requested schema. Use only values present "
            "in the supplied text, preserve dates and installment information, and never invent "
            "an issuer, balance, APR, limit, item, or category. Payments are account credits; "
            "purchases and interest are charges."
        ),
    )
