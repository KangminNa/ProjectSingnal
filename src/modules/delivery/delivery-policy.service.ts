import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_POLICY_REPOSITORY } from '@core/injection-tokens';
import type { DeliveryPolicyRepository } from '@core/repository';
import type { DeliveryPolicy } from '@core/entities';

@Injectable()
export class DeliveryPolicyService {
  constructor(
    @Inject(DELIVERY_POLICY_REPOSITORY) private readonly policyRepo: DeliveryPolicyRepository,
  ) {}

  async getById(id: string): Promise<DeliveryPolicy | null> {
    return this.policyRepo.findById(id);
  }

  async listByProject(projectId: string): Promise<DeliveryPolicy[]> {
    return this.policyRepo.listByProject(projectId);
  }
}
