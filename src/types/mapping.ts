export type SourcePlatform = "snowflake" | "databricks" | "cloudera_hive";

export type MappingMatch = "direct" | "partial" | "different" | "unknown";

export type MappingBasis = "documented" | "judgment";

export type BuyerRole = "engineer" | "cfo" | "security";

export type MappingCategory =
  | "compute"
  | "storage_format"
  | "catalog"
  | "security"
  | "ingestion"
  | "orchestration"
  | "bi_access";

export interface MappingRow {
  id: string;
  source_platform: SourcePlatform;
  source_term: string;
  iomete_term: string;
  match: MappingMatch;
  basis: MappingBasis;
  note: string;
  note_cfo?: string;
  note_security?: string;
  ask_iomete: string;
  iomete_doc_url: string;
  source_doc_url: string;
  url_verified: boolean;
  category: MappingCategory;
}
