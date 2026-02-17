'use client';

import { useState } from 'react';
import { Requirements, requirementsConfig } from '@/lib/formRequirements';
import BaseButton from '@/components/BaseButton';

type RequirementState = 'IN_PROGRESS' | 'SUBMITTED_BY_CLIENT' | 'APPROVED' | 'REJECTED';

interface RequirementCardProps {
  requirement: Requirements;
  state: RequirementState;
  onApprove: () => void;
  onReject: () => void;
}

function RequirementCard({ requirement, state, onApprove, onReject }: RequirementCardProps) {
  const config = requirementsConfig[requirement];

  const stateColors: Record<RequirementState, string> = {
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    SUBMITTED_BY_CLIENT: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const stateLabels: Record<RequirementState, string> = {
    IN_PROGRESS: 'In Progress',
    SUBMITTED_BY_CLIENT: 'Submitted by Client',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.label}</h3>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ml-4 ${stateColors[state]}`}>
          {stateLabels[state]}
        </span>
      </div>

      <div className="flex space-x-3">
        <BaseButton variant="success" size="sm" onClick={onApprove} className="flex-1">
          Approve
        </BaseButton>
        <BaseButton variant="danger" size="sm" onClick={onReject} className="flex-1">
          Reject
        </BaseButton>
      </div>
    </div>
  );
}

export default function AdminRequirementCardsContainer() {
  const [requirementStates, setRequirementStates] = useState<Record<Requirements, RequirementState>>(
    Object.values(Requirements).reduce(
      (acc, req) => {
        acc[req] = 'IN_PROGRESS';
        return acc;
      },
      {} as Record<Requirements, RequirementState>,
    ),
  );

  const handleApprove = (requirement: Requirements) => {
    console.log('Approve clicked for:', requirement);
    setRequirementStates((prev) => ({
      ...prev,
      [requirement]: 'APPROVED',
    }));
  };

  const handleReject = (requirement: Requirements) => {
    console.log('Reject clicked for:', requirement);
    setRequirementStates((prev) => ({
      ...prev,
      [requirement]: 'REJECTED',
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.values(Requirements).map((requirement) => (
          <RequirementCard
            key={requirement}
            requirement={requirement}
            state={requirementStates[requirement]}
            onApprove={() => handleApprove(requirement)}
            onReject={() => handleReject(requirement)}
          />
        ))}
      </div>
    </div>
  );
}
