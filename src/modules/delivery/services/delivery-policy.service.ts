import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_POLICY_REPOSITORY } from '@common/constants/injection-tokens';
import { DeliveryPolicyRepository } from '@domain/ports/outbound/repositories/delivery-policy.repository.port';
import { DeliveryPolicy } from '@domain/entities/delivery-policy.entity';

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
