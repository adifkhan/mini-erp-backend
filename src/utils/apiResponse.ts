export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data: T | null;
  public meta?: Record<string, unknown>;

  constructor(
    message: string,
    data: T | null = null,
    meta?: Record<string, unknown>,
  ) {
    this.success = true;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
}
