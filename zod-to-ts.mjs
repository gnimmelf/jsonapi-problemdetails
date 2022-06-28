import { z } from 'zod';
import { printNode, zodToTs } from 'zod-to-ts';

function log(zodObj) {
  Object.entries(zodObj).map(([k, v]) => {
    const { node } = zodToTs(v, k);
    console.log(`export type ${k}Type = ${printNode(node)}\n`);
  });
}

// -------------

const API_STATES = Object.freeze({
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  DONE: 'DONE',
});

const ApiReqState = z.enum(Object.keys(API_STATES))

const CreateApiState = z.object({
  apiName: z.string(),
  apiCall: z.function(),
  reqState: ApiReqState,
  result: z.record(z.string(), z.any()).optional(),
});

const StatefullApi = z.object({
  call: z.function(),
  isIdle: z.boolean(),
  isPending: z.boolean(),
  isDone: z.boolean(),
});

const ApiState = z.object({
  apiName: z.string(),
  apiCall: z.function(),
  reqState: ApiReqState,
  result: z.record(z.string(), z.any()).optional(),
});

log({ ApiState, ApiReqState, StatefullApi, CreateApiState });
