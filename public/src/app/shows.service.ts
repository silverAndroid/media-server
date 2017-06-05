import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ShowsService {

    constructor(private _http: Http) {
    }

    getShows(): Observable<any[]> {
        return this._http
            .get('http://localhost:8080/api/shows')
            .map(response => response.json().data);
    }

    getSeasons(showID: number): Observable<any> {
        return this._http
            .get(`http://localhost:8080/api/shows/${showID}`)
            .map(response => response.json().data);
    }
}
