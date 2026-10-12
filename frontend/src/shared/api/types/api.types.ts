import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

export type TQueryArgs = string | FetchArgs;

export type TQueryError = FetchBaseQueryError;
