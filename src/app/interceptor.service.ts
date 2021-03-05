import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, delay, mergeMap, retry, retryWhen } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable()
export class GlobalHttpInterceptorService implements HttpInterceptor {
  constructor(public router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 404 || error.status === 500) {
            return next.handle(req).pipe(
              retryControllForAuthErrors(),
              catchError((error: HttpErrorResponse) => {
                let errorMessage = `Interceptor Error: ${error.status} ${error.message}`;
                console.warn(errorMessage);
                return throwError(error);
              })
            );
          } else {
            //console.warn(`Interceptor Error: ${error.status} ${error.message}`);
            return throwError(error.message);
          }
        }
      })
    );
  }
}

const DEFAULT_DELAY = 1000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BACKOFF = 1000;

/**
 * we increase the delay after each retry.
 * The first retry happens after one second, the second one after two seconds
 * and the third one after three seconds.
 * @param delayMs Delay retry
 * @param maxRetry Http retries
 * @param backoffMs delay after each retry
 */
const retryControllForAuthErrors = (
  delayMs: number = DEFAULT_DELAY,
  maxRetry: number = DEFAULT_MAX_RETRIES,
  backoffMs: number = DEFAULT_BACKOFF
) => {
  let retries = 2;

  return (src: Observable<any>) =>
    src.pipe(
      retryWhen((errors: Observable<any>) =>
        errors.pipe(
          mergeMap((error) => {
            if (retries-- > 0) {
              console.log("Error en el when");
              const backoffTime = delayMs + (maxRetry - retries) * backoffMs;
              return of(error).pipe(delay(backoffTime));
            }
            return throwError(error);
          })
        )
      )
    );
};
