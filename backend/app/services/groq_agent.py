import json
import logging
from typing import Dict, Any, Optional, List
from app.config import settings

logger = logging.getLogger("groq_agent")

SYSTEM_PROMPT = """You are LedgerPilot, an AI finance operations controller.
You assist finance teams in understanding reconciliation results and investigating transaction exceptions.

CRITICAL RULES:
1. Never invent transaction values or currencies.
2. Never invent transaction IDs, order IDs, or settlement IDs.
3. Never modify financial records.
4. Treat the supplied reconciliation data strictly as the source of truth.
5. Do not perform manual arithmetic when a pre-calculated difference/value is already provided in the prompt.
6. If information is missing from the supplied data, explicitly state that it is unavailable.
7. Strictly distinguish facts from hypotheses. Use cautious phrasing such as "likely cause" or "evidence suggests" when analyzing possibilities.
8. When explaining discrepancies, explicitly cite the supplied fields (e.g., Expected Amount ₹5,000, Settled Amount ₹4,500, Difference ₹500).
9. If a transaction cannot be confidently resolved, explicitly declare that it requires human review.
10. Never hide exceptions or downplay critical variances.
11. Never claim that an exception was resolved unless the supplied data explicitly marks it as resolved.
12. Keep answers concise, professional, data-dense, and directly actionable for finance operations teams.

You are an investigation and explanation layer, not the financial source of truth."""

class GroqAgent:
    """
    Groq AI Agent for financial transaction investigations and
    natural language finance operations copilot.
    """
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.client = None
        self._init_client()

    def _init_client(self):
        import os
        from dotenv import load_dotenv
        load_dotenv(settings.BASE_DIR / ".env", override=True)
        self.api_key = os.getenv("GROQ_API_KEY", settings.GROQ_API_KEY)
        self.model = os.getenv("GROQ_MODEL", settings.GROQ_MODEL)
        if self.api_key and self.api_key.strip() and self.api_key != "your_groq_api_key_here":
            try:
                from groq import Groq
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Groq client: {e}")
                self.client = None

    def is_configured(self) -> bool:
        if not self.client:
            self._init_client()
        return self.client is not None

    def investigate_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Performs focused investigation on a single transaction using minimal, structured context.
        """
        # Build strict minimal context
        context_payload = {
            "order_id": transaction_data.get("order_id"),
            "transaction_id": transaction_data.get("transaction_id"),
            "settlement_id": transaction_data.get("settlement_id"),
            "customer_name": transaction_data.get("customer_name"),
            "expected_amount_inr": transaction_data.get("expected_amount"),
            "paid_amount_inr": transaction_data.get("paid_amount"),
            "settled_amount_inr": transaction_data.get("settled_amount"),
            "difference_inr": transaction_data.get("difference"),
            "payment_status": transaction_data.get("payment_status"),
            "settlement_status": transaction_data.get("settlement_status"),
            "payment_method": transaction_data.get("payment_method"),
            "bank_reference": transaction_data.get("bank_reference"),
            "reconciliation_status": transaction_data.get("status"),
            "auto_resolved": transaction_data.get("auto_resolved")
        }

        if not self.is_configured():
            return self._fallback_investigation(transaction_data)

        prompt = f"""Investigate this specific financial transaction record:
```json
{json.dumps(context_payload, indent=2)}
```

Provide your investigation as a strict JSON object with this schema:
{{
  "summary": "Concise summary of the discrepancy and transaction state",
  "evidence": ["Evidence point 1 citing specific fields and values", "Evidence point 2 citing specific fields and values"],
  "likely_cause": "Hypothesis of what caused this discrepancy based strictly on provided data",
  "recommended_action": "Clear operational next step for the finance controller",
  "confidence": 0.95,
  "requires_human_review": true
}}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            parsed = json.loads(content)
            
            # Format and validate
            return {
                "summary": parsed.get("summary", "Transaction discrepancy analysis complete."),
                "evidence": parsed.get("evidence", [f"Status: {context_payload['reconciliation_status']}", f"Discrepancy: ₹{context_payload['difference_inr']}"]),
                "likely_cause": parsed.get("likely_cause", "Review indicated variance in settlement batch."),
                "recommended_action": parsed.get("recommended_action", "Audit gateway transaction log."),
                "confidence": float(parsed.get("confidence", 0.90)),
                "requires_human_review": bool(parsed.get("requires_human_review", not context_payload["auto_resolved"])),
                "is_ai_generated": True,
                "model_used": self.model
            }
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            fallback = self._fallback_investigation(transaction_data)
            fallback["error_note"] = f"AI request failed ({str(e)}). Using deterministic controller fallback."
            return fallback

    def answer_copilot_question(self, question: str, batch_summary: Dict[str, Any], top_exceptions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Answers natural-language finance operations questions grounded strictly in aggregate batch context.
        """
        context = {
            "batch_metrics": {
                "total_records": batch_summary.get("total_records"),
                "matched_records": batch_summary.get("matched_records"),
                "tolerance_matches": batch_summary.get("tolerance_matches"),
                "amount_mismatches": batch_summary.get("amount_mismatches"),
                "missing_payments": batch_summary.get("missing_payments"),
                "missing_settlements": batch_summary.get("missing_settlements"),
                "duplicates": batch_summary.get("duplicates"),
                "date_mismatches": batch_summary.get("date_mismatches"),
                "unresolved_records": batch_summary.get("unresolved_records"),
                "match_rate_percent": batch_summary.get("match_rate"),
                "exception_rate_percent": batch_summary.get("exception_rate"),
                "accuracy_percent": batch_summary.get("accuracy"),
                "exception_recall_percent": batch_summary.get("exception_recall"),
                "auto_resolution_rate_percent": batch_summary.get("auto_resolution_rate"),
                "processing_time_ms": batch_summary.get("processing_time_ms"),
                "throughput_rps": batch_summary.get("throughput_rps"),
                "tolerance_inr": batch_summary.get("tolerance")
            },
            "sample_high_priority_exceptions": [
                {
                    "txn_id": e.get("transaction_id") or e.get("order_id"),
                    "type": e.get("exception_type"),
                    "diff_inr": e.get("difference"),
                    "expected_amt": e.get("expected_amount"),
                    "actual_amt": e.get("actual_amount"),
                    "severity": e.get("severity")
                }
                for e in top_exceptions[:8]
            ]
        }

        if not self.is_configured():
            return self._fallback_copilot_response(question, batch_summary, top_exceptions)

        prompt = f"""You are answering a question about the active reconciliation batch.
Current batch context:
```json
{json.dumps(context, indent=2)}
```

User question: "{question}"

Instructions:
- Provide a direct, professional, and data-grounded response.
- Cite exact metric figures from the context (e.g. match rate, record counts, exception categories).
- If the user asks about specific transactions or high-value exceptions, reference the supplied sample exceptions.
- Provide 2-3 relevant suggested follow-up questions."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            answer_text = response.choices[0].message.content
            
            followups = [
                "Which exceptions have the highest financial impact?",
                "How many records were auto-resolved under tolerance?",
                "What is the exception recall rate against ground truth?"
            ]
            
            return {
                "answer": answer_text,
                "grounded_stats": context["batch_metrics"],
                "suggested_followups": followups,
                "is_ai_generated": True,
                "model_used": self.model
            }
        except Exception as e:
            logger.error(f"Groq Copilot call failed: {e}")
            fallback = self._fallback_copilot_response(question, batch_summary, top_exceptions)
            fallback["answer"] += f"\n\n*(Note: Groq AI service unavailable ({str(e)}). Answer derived deterministically from batch metrics.)*"
            return fallback

    def draft_dispute_communication(
        self,
        transaction_data: Dict[str, Any],
        recipient_type: str = "bank",
        custom_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Drafts a formal partner dispute letter or escalation notice for bank nodal desks
        or payment gateway support with exact citations and transaction evidence.
        """
        order_id = transaction_data.get("order_id") or "N/A"
        txn_id = transaction_data.get("transaction_id") or "N/A"
        settlement_id = transaction_data.get("settlement_id") or "N/A"
        bank_ref = transaction_data.get("bank_reference") or "N/A"
        exp_amt = transaction_data.get("expected_amount") or 0.0
        settled_amt = transaction_data.get("settled_amount") or 0.0
        diff = transaction_data.get("difference") or 0.0
        status = transaction_data.get("status") or "EXCEPTION"

        recipient_map = {
            "bank": "HDFC / ICICI Nodal Settlement Desk",
            "gateway": "Razorpay Merchant Dispute & Settlements Support",
            "internal": "Internal FinOps & Treasury Escalation Team"
        }
        recipient_name = recipient_map.get(recipient_type.lower(), recipient_map["bank"])

        evidence = [
            f"Transaction ID / Gateway Ref: {txn_id}",
            f"Order Reference: {order_id}",
            f"Bank Reference / UTR: {bank_ref}",
            f"Settlement Batch ID: {settlement_id}",
            f"Expected Gross Amount: INR {exp_amt:,.2f}",
            f"Actual Settled Amount: INR {settled_amt:,.2f}",
            f"Discrepancy / Variance Amount: INR {diff:,.2f}",
            f"Reconciliation Classification: {status}"
        ]

        if not self.is_configured():
            return self._fallback_dispute(transaction_data, recipient_type, recipient_name, evidence)

        prompt = f"""Draft a formal, professional finance dispute / reconciliation inquiry communication:

Recipient: {recipient_name} (Type: {recipient_type})
Transaction Evidence:
{json.dumps(evidence, indent=2)}

Additional Context / Instructions:
{custom_instructions or "Request immediate audit, missing settlement credit, or fee discrepancy breakdown with UTR verification."}

Return a strict JSON object with:
{{
  "subject": "Clear, concise email subject with transaction ID and Rupee amount",
  "recipient": "{recipient_name}",
  "recipient_type": "{recipient_type}",
  "body": "Complete, formal, email/notice body with salutation, structured bulleted evidence, exact discrepancy figures, and required action / response timeline (24-48 hours). Professional tone signed by 'FinOps Controller Team, LedgerPilot'.",
  "evidence_summary": ["bullet 1", "bullet 2", "bullet 3"]
}}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            raw = response.choices[0].message.content
            parsed = json.loads(raw)
            return {
                "subject": parsed.get("subject", f"Dispute Notice: Reconciliation Variance for {txn_id}"),
                "recipient": recipient_name,
                "recipient_type": recipient_type,
                "body": parsed.get("body", ""),
                "evidence_summary": parsed.get("evidence_summary", evidence),
                "is_ai_generated": True,
                "model_used": self.model
            }
        except Exception as e:
            logger.error(f"Groq dispute drafting failed: {e}")
            return self._fallback_dispute(transaction_data, recipient_type, recipient_name, evidence)

    def _fallback_dispute(self, transaction_data: Dict[str, Any], recipient_type: str, recipient_name: str, evidence: List[str]) -> Dict[str, Any]:
        txn_id = transaction_data.get("transaction_id") or transaction_data.get("order_id") or "TXN-XXXX"
        diff = transaction_data.get("difference") or 0.0
        exp_amt = transaction_data.get("expected_amount") or 0.0
        settled_amt = transaction_data.get("settled_amount") or 0.0

        subject = f"URGENT: Settlement Reconciliation Variance - {txn_id} (INR {diff:,.2f})"
        body = f"""Dear {recipient_name},

We are writing to formally flag a reconciliation discrepancy identified during automated 3-way financial matching.

Summary of Discrepancy:
- Transaction ID: {txn_id}
- Order ID: {transaction_data.get('order_id', 'N/A')}
- Expected Gross Amount: INR {exp_amt:,.2f}
- Bank Settled Amount: INR {settled_amt:,.2f}
- Outstanding Variance: INR {diff:,.2f}
- Bank Reference / UTR: {transaction_data.get('bank_reference', 'N/A')}

Action Required:
1. Please confirm the debit/credit trace for the above referenced transaction.
2. Provide an itemized fee breakdown if this shortfall represents MDR, GST, or rolling reserves.
3. If this is an uncredited batch event, please initiate a credit adjustment or provide the revised settlement UTR.

We request your review and update within 24 business hours.

Sincerely,
FinOps Controller Team
LedgerPilot Automated Operations"""

        return {
            "subject": subject,
            "recipient": recipient_name,
            "recipient_type": recipient_type,
            "body": body,
            "evidence_summary": evidence,
            "is_ai_generated": False,
            "model_used": "Deterministic Dispute Template Engine"
        }

    def _fallback_investigation(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:

        st = transaction_data.get("status")
        exp_amt = transaction_data.get("expected_amount") or 0.0
        paid_amt = transaction_data.get("paid_amount")
        settled_amt = transaction_data.get("settled_amount")
        diff = transaction_data.get("difference") or 0.0
        order_id = transaction_data.get("order_id")
        txn_id = transaction_data.get("transaction_id") or "N/A"
        
        evidence = [
            f"Order ID: {order_id} | Expected Amount: ₹{exp_amt:,.2f}",
            f"Payment ID: {txn_id} | Paid Amount: ₹{paid_amt if paid_amt is not None else 0.0:,.2f}",
            f"Settlement ID: {transaction_data.get('settlement_id') or 'None'} | Settled: ₹{settled_amt if settled_amt is not None else 0.0:,.2f}",
            f"Calculated Discrepancy: ₹{diff:,.2f} | Status: {st}"
        ]
        
        likely_cause = "Discrepancy identified between ledger expectations and bank settlement feed."
        recommended_action = "Review gateway logs and bank settlement statement."
        
        if st == "AMOUNT_MISMATCH":
            likely_cause = f"Settlement amount (₹{settled_amt:,.2f}) has a shortfall of ₹{diff:,.2f} against expected amount (₹{exp_amt:,.2f}). Possible MDR fee deduction or partial settlement."
            recommended_action = "Verify merchant fee schedule or bank deduction breakdown before ledger reconciliation."
        elif st == "MISSING_PAYMENT":
            likely_cause = "No matching payment transaction recorded for this internal order ID in the gateway dataset."
            recommended_action = "Check for abandoned checkout or unreceived webhook payload from payment gateway."
        elif st == "MISSING_SETTLEMENT":
            likely_cause = "Payment captured at gateway but missing from banking settlement batch."
            recommended_action = "Contact banking partner to trace unsettled transaction batch reference."
        elif st == "DUPLICATE":
            likely_cause = f"Duplicate transaction ID {txn_id} encountered across multiple records."
            recommended_action = "Verify customer charge status and check for potential duplicate payment captures."

        return {
            "summary": f"Transaction {txn_id} classified as {st} with variance ₹{diff:,.2f}.",
            "evidence": evidence,
            "likely_cause": likely_cause,
            "recommended_action": recommended_action,
            "confidence": 0.95,
            "requires_human_review": not transaction_data.get("auto_resolved", False),
            "is_ai_generated": False,
            "model_used": "Deterministic Finance Controller Engine"
        }

    def _fallback_copilot_response(self, question: str, batch_summary: Dict[str, Any], top_exceptions: List[Dict[str, Any]]) -> Dict[str, Any]:
        q_lower = question.lower()
        total = batch_summary.get("total_records", 0)
        match_rate = batch_summary.get("match_rate", 0.0)
        exceptions = batch_summary.get("amount_mismatches", 0) + batch_summary.get("missing_payments", 0) + batch_summary.get("missing_settlements", 0) + batch_summary.get("duplicates", 0) + batch_summary.get("date_mismatches", 0) + batch_summary.get("unresolved_records", 0)
        
        if "first" in q_lower or "priority" in q_lower or "high" in q_lower:
            ans = f"In the current batch of {total} records, focus first on CRITICAL and HIGH severity exceptions:\n"
            for e in top_exceptions[:4]:
                ans += f"- **{e.get('transaction_id') or e.get('order_id')}** ({e.get('exception_type')}): Variance of ₹{e.get('difference', 0.0):,.2f}\n"
            ans += "\nThese represent the highest financial exposure and should be audited before closing the ledger period."
        elif "match rate" in q_lower or "fall" in q_lower or "rate" in q_lower:
            ans = f"The current batch achieved a **{match_rate}% match rate** across {total} records ({batch_summary.get('matched_records', 0)} exact matches, {batch_summary.get('tolerance_matches', 0)} tolerance matches). There are {exceptions} exceptions requiring attention ({batch_summary.get('amount_mismatches', 0)} amount mismatches, {batch_summary.get('missing_payments', 0)} missing payments, {batch_summary.get('missing_settlements', 0)} missing settlements, {batch_summary.get('duplicates', 0)} duplicates)."
        elif "missing" in q_lower:
            ans = f"There are **{batch_summary.get('missing_payments', 0)} missing payments** and **{batch_summary.get('missing_settlements', 0)} missing settlements** in this batch. Missing payments indicate dropped gateway webhooks, while missing settlements indicate pending or omitted bank settlement batches."
        else:
            ans = f"Reconciliation batch summary: {total} total records processed. Match rate: {match_rate}%. Accuracy against ground truth: {batch_summary.get('accuracy', 0.0)}%. Total exceptions detected: {exceptions}. Measured throughput: {batch_summary.get('throughput_rps', 0.0)} records/sec."

        return {
            "answer": ans,
            "grounded_stats": batch_summary,
            "suggested_followups": [
                "Show me the highest-value exceptions",
                "Which transactions require human review?",
                "How many settlements are missing?"
            ],
            "is_ai_generated": False,
            "model_used": "Deterministic Copilot Fallback"
        }

groq_agent = GroqAgent()
