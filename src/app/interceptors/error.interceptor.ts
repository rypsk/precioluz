import { HttpInterceptorFn } from '@angular/common/http';

export const ErrorInterceptor: HttpInterceptorFn = (req: any, next: any) => {
  // console.log('----- Interceptor Message -----');
  // console.log(req.url);
  return next(req);
};
