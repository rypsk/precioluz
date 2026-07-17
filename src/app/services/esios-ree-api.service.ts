import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EsiosApiResponse } from '../models/esios-api-response';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EsiosReeApiService {

  private readonly ESIOS_REE_API_URL = 'https://api.esios.ree.es/indicators/1001';
  private readonly ESIOS_REE_API_KEY = environment.esiosApiKey;
  httpClient = inject(HttpClient);

  constructor() { }

  getData(requestDate: string) {
    const date = new Date(requestDate);
    let startDate = date.toLocaleDateString('en-GB').split('/').reverse().join('-') + 'T00:00:00';
    let endDate = date.toLocaleDateString('en-GB').split('/').reverse().join('-') + 'T23:59:59';
    const options = {
      headers: new HttpHeaders().set('Accept', 'application/json; application/vnd.esios-api-v2+json')
        .set('Content-Type', 'application/json')
        .set('x-api-key', this.ESIOS_REE_API_KEY),
      params: new HttpParams().set('geo_ids[]', '8741').set('start_date', startDate).set('end_date', endDate)
    };
    return this.httpClient.get<EsiosApiResponse>(this.ESIOS_REE_API_URL, options).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Solo logueamos el error de forma simplificada para evitar ruidos en SSR si es un error conocido
    if (error.status === 403) {
      console.error('Acceso denegado a la API de ESIOS (403 Forbidden).');
      return throwError(() => new Error('ESIOS API Error: 403 Forbidden'));
    } else {
      console.error('Ocurrió un error en la API:', error.message);
      return throwError(() => new Error('Something bad happened; please try again later.'));
    }
  }

}
