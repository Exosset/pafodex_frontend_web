export interface Pagination {
    page: number;          // page actuelle (souvent 1-indexed)
    perPage: number;
    total: number;
    pages: number;
}