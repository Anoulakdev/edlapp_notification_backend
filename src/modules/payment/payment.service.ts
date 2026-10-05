import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';

interface CachedTotal {
  totalAmount: number;
  cachedAt: number;
}

const summaryCache = new Map<string, CachedTotal>();
const SUMMARY_CACHE_TTL = 60 * 1000; // 60 seconds

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    user: AuthUser,
    query: {
      accountNo?: string;
      paymentDateFrom?: string;
      paymentDateTo?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    try {
      const url = process.env.URL_PAYMENT_API;
      const token = process.env.PAYMENT_TOKEN;

      if (!url) {
        throw new HttpException(
          'URL_PAYMENT_API is not configured in .env',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (!token) {
        throw new HttpException(
          'PAYMENT_TOKEN is not configured in .env',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const params: Record<string, any> = {
        page: Number(query.page) || 1,
        pageSize: Number(query.pageSize) || 10,
      };

      if (query.status) {
        params.status = query.status;
      }

      if (user.branchId) {
        params.provinceId = Number(user.branchId);
      }

      if (query.paymentDateFrom) {
        params.paymentDateFrom = query.paymentDateFrom;
      }

      if (query.paymentDateTo) {
        params.paymentDateTo = query.paymentDateTo;
      }

      if (query.accountNo) {
        params.accountNo = query.accountNo;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(url, {
        params,
        timeout: 30000,
        headers,
      });

      const parseAmount = (val: any): number => {
        if (val === null || val === undefined) return 0;
        const clean =
          typeof val === 'string' ? val.replace(/,/g, '').trim() : val;
        const num = Number(clean);
        return isNaN(num) ? 0 : num;
      };

      let totalAmount = 0;
      if (response.data?.totalAmount !== undefined && response.data?.totalAmount !== null) {
        totalAmount = parseAmount(response.data.totalAmount);
      } else if (response.data?.total_amount !== undefined && response.data?.total_amount !== null) {
        totalAmount = parseAmount(response.data.total_amount);
      } else if (response.data && Array.isArray(response.data.items)) {
        if (response.data.totalPages <= 1 && Number(params.page) === 1) {
          totalAmount = response.data.items.reduce(
            (sum: number, item: any) => sum + parseAmount(item.paid_amount),
            0,
          );
        } else {
          const cacheKey = `${params.provinceId || ''}_${params.status || ''}_${params.paymentDateFrom || ''}_${params.paymentDateTo || ''}_${params.accountNo || ''}`;
          const now = Date.now();
          const cached = summaryCache.get(cacheKey);

          if (cached && now - cached.cachedAt < SUMMARY_CACHE_TTL) {
            totalAmount = cached.totalAmount;
          } else {
            try {
              // The external BCEL API strictly caps pageSize to 100.
              // To accurately sum paid_amount across all items, fetch pages in parallel batches of 10.
              const totalCount = Number(response.data.totalCount) || 0;
              const totalPages = Math.ceil(totalCount / 100);

              const baseFilterParams: Record<string, any> = {};
              if (params.status) baseFilterParams.status = params.status;
              if (params.provinceId) baseFilterParams.provinceId = params.provinceId;
              if (params.paymentDateFrom) baseFilterParams.paymentDateFrom = params.paymentDateFrom;
              if (params.paymentDateTo) baseFilterParams.paymentDateTo = params.paymentDateTo;
              if (params.accountNo) baseFilterParams.accountNo = params.accountNo;

              let calculatedTotal = 0;
              const BATCH_SIZE = 10;
              const maxPagesToFetch = Math.min(totalPages, 50);

              for (let startPage = 1; startPage <= maxPagesToFetch; startPage += BATCH_SIZE) {
                const endPage = Math.min(startPage + BATCH_SIZE - 1, maxPagesToFetch);
                const pagePromises: Promise<any[]>[] = [];

                for (let p = startPage; p <= endPage; p++) {
                  pagePromises.push(
                    axios
                      .get(url, {
                        params: { ...baseFilterParams, page: p, pageSize: 100 },
                        headers,
                        timeout: 15000,
                      })
                      .then((r) => r.data?.items || [])
                      .catch(() => []),
                  );
                }

                const batchResults = await Promise.all(pagePromises);
                for (const items of batchResults) {
                  for (const item of items) {
                    calculatedTotal += parseAmount(item.paid_amount);
                  }
                }
              }

              totalAmount = calculatedTotal;
              summaryCache.set(cacheKey, { totalAmount, cachedAt: now });

              // Periodic cleanup
              if (summaryCache.size > 200) {
                for (const [key, val] of summaryCache.entries()) {
                  if (now - val.cachedAt > SUMMARY_CACHE_TTL) {
                    summaryCache.delete(key);
                  }
                }
              }
            } catch (err: any) {
              console.error(
                'Failed to fetch summary total amount:',
                err?.response?.data || err?.message,
              );
              totalAmount = response.data.items.reduce(
                (sum: number, item: any) => sum + parseAmount(item.paid_amount),
                0,
              );
            }
          }
        }
      }

      return {
        ...response.data,
        totalAmount,
      };
    } catch (error) {
      // If external API returns 404 (No payment data found), return an empty list gracefully
      if (error?.response?.status === 404) {
        return {
          items: [],
          page: Number(query.page) || 1,
          pageSize: Number(query.pageSize) || 10,
          totalCount: 0,
          totalPages: 0,
          totalAmount: 0,
        };
      }

      console.error(
        'Error fetching payments from external API:',
        error?.response?.data || error.message,
      );
      if (error.response) {
        throw new HttpException(
          error.response.data || 'Failed to fetch transaction data',
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        error.message || 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
