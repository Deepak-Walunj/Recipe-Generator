import { ValidationError } from './exception.js';
import { setupLogging, getLogger } from './logger.js';

setupLogging();
const logger = getLogger('utility');

export async function buildRecipeStepsPayload(recipeId, instruction) {
    if (!recipeId || isNaN(recipeId)) {
        throw new ValidationError("Invalid recipeId", 400, "VALIDATION_ERROR");
    }
    if (!instruction || typeof instruction !== 'string') {
        throw new ValidationError("Invalid instruction", 400, "VALIDATION_ERROR");
    }
    const steps = instruction
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        instruction: line
    }))
    if (!steps.length) {
        throw new ValidationError("Instruction must contain at least one step");
        }
    return steps;
}