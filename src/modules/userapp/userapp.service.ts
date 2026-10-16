import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateUserappDto } from './dto/create-userapp.dto';

function extractErrorMessage(error: any, fallback: string): string {
  const msg = error.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  if (error.response?.data?.error) return String(error.response?.data?.error);
  return error.message || fallback;
}

@Injectable()
export class UserappService {
  private getApiConfig() {
    const url = process.env.EDLAPP_URL_API;
    const apiKey = process.env.API_KEY;

    if (!url) {
      throw new BadRequestException('EDLAPP_URL_API is not configured');
    }

    return {
      url,
      headers: {
        'x-api-key': apiKey || '',
      },
      timeout: 30000,
    };
  }

  async create(createUserappDto: CreateUserappDto) {
    try {
      const config = this.getApiConfig();
      const response = await axios.post(config.url, createUserappDto, {
        headers: config.headers,
        timeout: config.timeout,
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Failed to create userapp in EDL App API:',
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        extractErrorMessage(error, 'Failed to create user in EDL App'),
      );
    }
  }

  async findAll(page?: number, limit?: number, search?: string) {
    try {
      const config = this.getApiConfig();
      const trimmedSearch = search?.trim();

      const response = await axios.get(config.url, {
        params: {
          page,
          limit,
          search: trimmedSearch || undefined,
        },
        headers: config.headers,
        timeout: config.timeout,
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Failed to fetch userapp from EDL App API:',
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        extractErrorMessage(error, 'Failed to fetch users from EDL App'),
      );
    }
  }

  async update(id: number) {
    try {
      const config = this.getApiConfig();
      const response = await axios.put(
        `${config.url}/${id}`,
        {},
        {
          headers: config.headers,
          timeout: config.timeout,
        },
      );

      return response.data;
    } catch (error: any) {
      console.error(
        `Failed to update userapp #${id}:`,
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        extractErrorMessage(error, `Failed to update userapp #${id}`),
      );
    }
  }
}
