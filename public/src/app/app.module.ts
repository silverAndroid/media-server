import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgModule} from "@angular/core";

import {AppComponent} from "./app.component";
import {MaterialModule} from "./modules/material.module";
import {PageMoviesComponent} from "./page-movies/page-movies.component";
import {MovieComponent} from "./movie/movie.component";
import {PageShowsComponent} from "./page-shows/page-shows.component";
import {ShowComponent} from "./show/show.component";
import {ShowsService} from "./shows.service";
import {HttpModule} from "@angular/http";
import {FlexLayoutModule} from "@angular/flex-layout";
import {RouterModule} from "@angular/router";
import {PageSeasonsComponent} from "./page-seasons/page-seasons.component";
import {SeasonComponent} from "./season/season.component";
import { PageEpisodesComponent } from './page-episodes/page-episodes.component';
import { EpisodeComponent } from './episode/episode.component';

@NgModule({
    declarations: [
        AppComponent,
        PageMoviesComponent,
        MovieComponent,
        PageShowsComponent,
        ShowComponent,
        PageSeasonsComponent,
        SeasonComponent,
        PageEpisodesComponent,
        EpisodeComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FlexLayoutModule,
        HttpModule,
        MaterialModule,
        RouterModule.forRoot([
            {
                path: 'shows',
                component: PageShowsComponent
            },
            {
                path: 'shows/:id',
                component: PageSeasonsComponent
            },
            {
                path: 'shows/:id/:season',
                component: PageEpisodesComponent
            }
        ])
    ],
    providers: [
        ShowsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
