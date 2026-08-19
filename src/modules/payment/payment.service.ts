import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    user: AuthUser,
    query: {
      accountNo?: string;
      paymentDateFrom?: string;
      paymentDateTo?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    try {
      const url = process.env.URL_PAYMENT_API;
      if (!url) {
        throw new HttpException(
          'URL_PAYMENT_API is not configured in .env',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const params: Record<string, any> = {
        status: 'SUCCESS',
        page: Number(query.page) || 1,
        pageSize: Number(query.pageSize) || 10,
      };

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

      const response = await axios.get(url, {
        params,
        timeout: 30000,
      });

      let totalAmount = 0;
      if (response.data && Array.isArray(response.data.items)) {
        if (response.data.totalPages <= 1) {
          totalAmount = response.data.items.reduce(
            (sum: number, item: any) => sum + (Number(item.paid_amount) || 0),
            0,
          );
        } else {
          try {
            // Calculate total amount across all records matching current query
            const summaryParams = { ...params, page: 1, pageSize: 10000 };
            const summaryRes = await axios.get(url, {
              params: summaryParams,
              timeout: 10000,
            });
            if (summaryRes.data && Array.isArray(summaryRes.data.items)) {
              totalAmount = summaryRes.data.items.reduce(
                (sum: number, item: any) =>
                  sum + (Number(item.paid_amount) || 0),
                0,
              );
            }
          } catch {
            totalAmount = response.data.items.reduce(
              (sum: number, item: any) => sum + (Number(item.paid_amount) || 0),
              0,
            );
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
