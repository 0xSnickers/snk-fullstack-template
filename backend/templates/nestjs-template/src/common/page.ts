import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}

export function pageResult<T>(items: T[], total: number, { page, limit }: PageQueryDto) {
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
