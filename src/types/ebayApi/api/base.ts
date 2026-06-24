import { AxiosRequest, type IEBayApiRequest } from '../request.js';
import type { AppConfig } from '../types/index.js';

/**
 * Abstract superclass.
 */
export default abstract class Base {
  protected constructor(
    public readonly config: AppConfig,
    public readonly req: IEBayApiRequest = new AxiosRequest(config.axiosConfig),
  ) {}
}
