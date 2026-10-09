import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import http from 'http';
import https from 'https';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class BsService {
  private readonly axiosInstance: AxiosInstance = axios.create({
    httpAgent: new http.Agent({ keepAlive: true, maxSockets: 100 }),
    httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 100 }),
    timeout: 30000,
  });

  async findAll(
    provinceId: number,
    accountNo: string,
    start_year: string,
    end_year: string,
  ) {
    try {
      const url = process.env.URL_BS;

      if (!url) {
        throw new HttpException(
          'URL_BS is not configured in .env',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (
        provinceId === undefined ||
        provinceId === null ||
        String(provinceId).trim() === '' ||
        isNaN(Number(provinceId))
      ) {
        throw new HttpException(
          'provinceId is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!accountNo || !String(accountNo).trim()) {
        throw new HttpException(
          'accountNo is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!start_year || !String(start_year).trim()) {
        throw new HttpException(
          'start_year is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!end_year || !String(end_year).trim()) {
        throw new HttpException('end_year is required', HttpStatus.BAD_REQUEST);
      }

      const cleanUrl = url.replace(/\/+$/, '');
      const params = {
        account_no: String(accountNo).trim(),
        province_id: Number(provinceId),
        start_y: String(start_year).trim(),
        end_y: String(end_year).trim(),
      };

      const fetchApi = async (
        endpoint: string,
        customParams: Record<string, any> = params,
      ) => {
        try {
          const res = await this.axiosInstance.get(`${cleanUrl}/${endpoint}/`, {
            params: customParams,
          });
          return res.data;
        } catch (error: any) {
          if (error?.response?.status === 404) {
            return {
              statusCode: 404,
              message:
                error.response.data?.errorr?.message ||
                error.response.data?.message ||
                'Data not found',
              data: [],
            };
          }
          throw error;
        }
      };

      const [energy, debt, meterProgress] = await Promise.all([
        fetchApi('masterList'),
        fetchApi('meterHis'),
        fetchApi('metterProgress', {
          account_no: String(accountNo).trim(),
          province_id: Number(provinceId),
        }),
      ]);

      return {
        meterProgress,
        energy,
        debt,
      };
    } catch (error: any) {
      console.error(
        '[BsService] Error calling billing API:',
        error?.response?.data || error?.message || error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      if (error?.response) {
        throw new HttpException(
          error.response.data?.errorr?.message ||
            error.response.data?.message ||
            'Error from Billing Service API',
          error.response.status || HttpStatus.BAD_GATEWAY,
        );
      }

      throw new HttpException(
        error?.message || 'Failed to connect to Billing Service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
