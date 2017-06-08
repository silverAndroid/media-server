import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ShowsService {

    constructor(private _http: Http) {
    }

    getShows(): Observable<any[]> {
        return this._http
            .get('/api/shows')
            .map(response => response.json().data);
    }

    getSeasons(showID: number): Observable<any[]> {
        return this._http
            .get(`/api/shows/${showID}`)
            .map(response => response.json().data);
    }

    getEpisodes(showID: number, season: number): Observable<any[]> {
        return this._http
            .get(`/api/shows/${showID}/${season}`)
            .map(response => response.json().data);
    }
}
