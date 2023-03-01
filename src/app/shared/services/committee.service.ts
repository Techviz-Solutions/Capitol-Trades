import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {
  constructor() { }
  private _name: string;
  addName(name: string) {
    this._name = name;
  }
  getName() {
    return this._name;
  }
}
