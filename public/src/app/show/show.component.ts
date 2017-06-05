import {Component, Input, OnInit} from "@angular/core";
import {Show} from "../show";

@Component({
    selector: 'show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css']
})
export class ShowComponent implements OnInit {

    @Input('data')
    show: Show;

    constructor() {
    }

    ngOnInit() {
    }

}
