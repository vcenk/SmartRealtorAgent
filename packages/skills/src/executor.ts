import type { SkillDefinition, SkillExecutionContext } from './types';

export const executeSkill = async <I, O>(
  skill: SkillDefinition<I, O>,
  rawInput: unknown,
  context: SkillExecutionContext,
): Promise<O> => {
  const allowed = await skill.permissionGate(context);
  if (!allowed) {
    throw new Error(`Permission denied for ${skill.name}`);
  }

  const input = skill.inputSchema.parse(rawInput);
  const output = await skill.execute(input, context);
  return skill.outputSchema.parse(output);
};
