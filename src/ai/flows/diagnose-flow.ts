
'use server';
/**
 * @fileOverview A medical diagnosis AI agent.
 *
 * - diagnose - A function that handles the diagnosis process based on notes.
 * - DiagnoseInput - The input type for the diagnose function.
 * - DiagnoseOutput - The return type for the diagnose function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicalRecordSchema = z.object({
    date: z.string(),
    doctor: z.string(),
    diagnosis: z.string(),
    notes: z.string(),
});

const DiagnoseInputSchema = z.object({
  notes: z.string().describe('The clinical notes from the doctor for the current visit.'),
  previousRecords: z.array(MedicalRecordSchema).optional().describe("The patient's past medical records."),
});
export type DiagnoseInput = z.infer<typeof DiagnoseInputSchema>;

const DiagnoseOutputSchema = z.object({
  diagnosis: z
    .string()
    .describe('A concise diagnosis based on the clinical notes and patient history.'),
  treatmentPlan: z.string().describe('A suggested, brief treatment plan.'),
  followUp: z
    .string()
    .describe(
      'A suggested follow-up action, like "Schedule a follow-up in 2 weeks" or "No follow-up needed".'
    ),
});
export type DiagnoseOutput = z.infer<typeof DiagnoseOutputSchema>;

export async function diagnose(input: DiagnoseInput): Promise<DiagnoseOutput> {
  return diagnoseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePrompt',
  input: {schema: DiagnoseInputSchema},
  output: {schema: DiagnoseOutputSchema},
  prompt: `You are an expert medical assistant. Your task is to analyze the provided clinical notes and the patient's medical history to formulate a concise diagnosis, a suggested treatment plan, and a follow-up recommendation.

Current Visit Notes:
{{{notes}}}

{{#if previousRecords}}
Patient's Past Medical History (for context):
{{#each previousRecords}}
- Date: {{this.date}}, Diagnosis: {{this.diagnosis}}, Doctor: {{this.doctor}}, Notes: {{this.notes}}
{{/each}}
{{/if}}

Based on the combination of the current notes and the patient's history, provide a clear and brief diagnosis, a potential treatment plan, and a recommended follow-up action.`,
});

const diagnoseFlow = ai.defineFlow(
  {
    name: 'diagnoseFlow',
    inputSchema: DiagnoseInputSchema,
    outputSchema: DiagnoseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
