import { Requirements, requirementsConfig } from './formRequirements';

describe('formRequirements', () => {
  let optionalRequirements: Requirements[];
  let requiredRequirements: Requirements[];

  beforeEach(() => {
    optionalRequirements = [];
    requiredRequirements = [];

    Object.entries(requirementsConfig).forEach(([requirement, config]) => {
      if (config.requiredFileCount > 0) {
        // required
        requiredRequirements.push(requirement as Requirements);
      } else if (config.expectedFileCount > 0) {
        // not required, but we expect something to be uploaded
        optionalRequirements.push(requirement as Requirements);
      } else {
        // not required, and we don't expect anything to be uploaded
        // do nothing
      }
    });
  });

  it('non-required files should have a warning message', () => {
    optionalRequirements.forEach((requirement) => {
      try {
        expect(requirementsConfig[requirement].warningMessage).toBeDefined();
      } catch {
        throw new Error(`Warning message is not defined for ${requirement}`);
      }
    });
  });
});
