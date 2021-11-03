import type { Msg, NatsConnection } from 'nats';

/** Context type, to be shared across services */
export type Context = {
  nc: NatsConnection;
  log: typeof console.log;
  request: ClientRequest;
  publish: ClientPublish;
};

export type RequestContext<T = any> = Context & {
  id?: string;
  message: Msg;
  data?: T;
  handleUnit: ServiceLike;
};

export type ResponseContext<T = any> = RequestContext & {
  response?: T;
  error?: any;
};

export type InitialContext = Context & {
  beforeMiddlewares: MiddlewareOps[];
  afterMiddlewares: Array<MiddlewareOps<ResponseContext>>;
  closeMiddlewares: MiddlewareOps[];
  errorMiddlewares: MiddlewareOps[];
};

export type Req = {};

// Middleware
export type OkOps<T> = {
  type: 'ok';
  data?: T;
};

export type NotOkOps<T> = {
  type: 'error';
  errorCode?: string;
  errorMessage?: string;
  data?: T;
};

export type Result<R, E> = [OkOps<R>, undefined] | [undefined, NotOkOps<E>];

export type Handle<Rq extends Req, Rt, Er = any> = {
  (ctx: RequestContext<Rq>): Promise<Result<Rt, Er>>;
};

type MiddlewareOps<T = {}> = (
  ctx: RequestContext & T
) => Promise<Result<void, void>>;

type MiddlewareStruct<T = {}> = {
  before?: MiddlewareOps<T>;
  after?: MiddlewareOps<ResponseContext & T>;
  error?: MiddlewareOps<T>;
  close?: MiddlewareOps<T>;
};

export type Middleware<T = {}> = (
  initialContext: InitialContext
) => Promise<MiddlewareStruct<T>>;

export type Subject = string | string[] | { subject: string; queue: string };

export type SubjectConfig = string;

export type Service<S extends SubjectConfig, Input, Return> = {
  subject: S;
  middlewares?: Middleware[];
  handle: Handle<Input, Return, any>;
  validate?: Handle<Input, Result<any, any>>;
  authorize?: Handle<Input, Result<any, any>>;
};

export type ServiceLike = Service<SubjectConfig, any, any>;

export type Handler<T extends Service<any, any, any>> = T['handle'];
export type Validator<T extends Service<any, any, any>> = T['validate'];
export type Authorizor<T extends Service<any, any, any>> = T['authorize'];

export type Channel<S extends SubjectConfig, Input> = Service<S, Input, void>;
export type ChannelLike = Channel<string, any>;

export type ExtractRequest<Type> = Type extends Service<any, infer X, any>
  ? X
  : never;
export type ExtractResponse<Type> = Type extends Service<any, any, infer X>
  ? X
  : never;

export type ClientRequest = <T extends ServiceLike>(
  subject: T['subject'],
  request: ExtractRequest<T>
) => Promise<ExtractResponse<T>>;

export type ClientPublish = <T extends ChannelLike>(
  subject: T['subject'],
  request: ExtractRequest<T>
) => void;