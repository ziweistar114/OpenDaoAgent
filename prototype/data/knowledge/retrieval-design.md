# Retrieval Design Notes

The first retrieval layer should not depend on a full vector database.

For Phase 1, a simpler approach is acceptable as long as it remains local-first, explainable, and easy for outside contributors to understand.

One practical path is to split local documents into small chunks, extract lightweight tags, and score those chunks against the incoming query.

This is not the final retrieval architecture, but it gives the prototype a clearer path from document ingestion to grounded response generation.

The next step after chunk retrieval is to add better indexing, source ranking, and chunk-level metadata that can later be replaced without rewriting the whole prototype.
