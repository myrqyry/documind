import { z } from 'zod';

export const entitySchema = z.object({
  id: z.string().describe("Unique identifier for the entity."),
  name: z.string().describe("The name of the entity."),
  type: z.enum(['class', 'function', 'api', 'concept', 'tool', 'framework']).describe("The type of the entity."),
  description: z.string().describe("A brief description of the entity."),
  importance: z.number().min(0).max(1).describe("A score from 0 to 1 indicating the importance of the entity."),
  mentions: z.number().int().min(0).describe("The number of times the entity is mentioned in the document."),
  context: z.array(z.string()).describe("An array of contextual snippets where the entity is mentioned."),
});

export const relationshipSchema = z.object({
  source: z.string().describe("The ID of the source entity."),
  target: z.string().describe("The ID of the target entity."),
  type: z.enum(['uses', 'extends', 'implements', 'requires', 'contains', 'similar']).describe("The type of the relationship."),
  strength: z.number().min(0).max(1).describe("A score from 0 to 1 indicating the strength of the relationship."),
  description: z.string().describe("A brief description of the relationship."),
});

export const conceptSchema = z.object({
  id: z.string().describe("Unique identifier for the concept."),
  name: z.string().describe("The name of the concept."),
  definition: z.string().describe("A clear and concise definition of the concept."),
  examples: z.array(z.string()).describe("An array of examples illustrating the concept."),
  relatedConcepts: z.array(z.string()).describe("An array of IDs of related concepts."),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe("The difficulty level of the concept."),
});

export const dependencySchema = z.object({
  id: z.string().describe("Unique identifier for the dependency."),
  name: z.string().describe("The name of the dependency."),
  type: z.enum(['prerequisite', 'optional', 'alternative']).describe("The type of the dependency."),
  description: z.string().describe("A brief description of the dependency."),
  satisfied: z.boolean().describe("Whether the dependency is satisfied."),
});

export const learningStepSchema = z.object({
  id: z.string().describe("Unique identifier for the learning step."),
  title: z.string().describe("The title of the learning step."),
  description: z.string().describe("A brief description of the learning step."),
  prerequisites: z.array(z.string()).describe("An array of IDs of prerequisite learning steps."),
  concepts: z.array(z.string()).describe("An array of IDs of concepts covered in this learning step."),
  estimatedTime: z.number().int().min(0).describe("The estimated time in minutes to complete this learning step."),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe("The difficulty level of the learning step."),
});

export const semanticAnalysisSchema = z.object({
  entities: z.array(entitySchema).describe("An array of entities extracted from the document."),
  relationships: z.array(relationshipSchema).describe("An array of relationships between entities."),
  concepts: z.array(conceptSchema).describe("An array of concepts discussed in the document."),
  dependencies: z.array(dependencySchema).describe("An array of dependencies identified in the document."),
  learningPath: z.array(learningStepSchema).describe("A suggested learning path based on the document's content."),
});
