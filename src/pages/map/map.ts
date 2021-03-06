/*
    Copyright 2017 Lamy Corentin, Lemaire Jerome

    This file is part of UCLCampus.

    UCLCampus is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    UCLCampus is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with UCLCampus.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Component, ElementRef, ViewChild } from '@angular/core';
import { POIService } from '../../providers/poi-service';
import { MapService } from '../../providers/map-service';
import { MapLocationSelectorPage } from '../map-location-selector/map-location-selector';
import { NavController, Platform, ActionSheetController, ModalController, MenuController } from 'ionic-angular';
import { GoogleMap } from '@ionic-native/google-maps';
import { MapLocation } from '../../app/entity/mapLocation';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('pleaseConnect') pleaseConnect: ElementRef;
  showedLocations: MapLocation[] = [];
  zones: any;
  filters : any;
  excludedFilters : any = [];
  selectedLocation: any = [];
  userLocation:any = [];
  showLocationList = false;
  map: GoogleMap;

  constructor(public navCtrl: NavController,
    public modalCtrl: ModalController,
    public actionSheetCtrl: ActionSheetController,
    public mapService: MapService,
    public platform: Platform,
    public poilocations: POIService,
    public menuCtrl: MenuController) {

  }

  ionViewDidLoad(){
    this.platform.ready().then(() => {
      let mapLoaded = this.mapService.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement);
      let zones = this.poilocations.loadResources();

      Promise.all([
        mapLoaded,
        zones
      ]).then((result) => {
        this.zones = result[1];
        this.filters = this.zones;
        this.userLocation = new MapLocation( "My Position",
                                    "My address",
                                    this.mapService.getUserLocation().lat,
                                    this.mapService.getUserLocation().lng,
                                    "MYPOS");
        this.selectedLocation = this.userLocation;
        this.showedLocations.push(this.selectedLocation);
        this.mapService.addMarker(this.selectedLocation.lat, this.selectedLocation.lng, this.selectedLocation.address, this.selectedLocation.title);
      });

    });
  }

  toggleDetails(data) {
    if (data.showDetails) {
        data.showDetails = false;
        data.icon = 'arrow-dropdown';
    } else {
        data.showDetails = true;
        data.icon = 'arrow-dropup';
    }
  }

  toggleLocation(data, checkList, index) {
    if (checkList[index] === true) {
      this.addShowedLocations(data);
    } else {
      this.removeShowedLocations(data);
    }
  }

  addShowedLocations(rawLocation){
    this.showedLocations.push(rawLocation);
  }

  removeShowedLocations(rawLocation){
    let locToRemove = this.showedLocations.find(item => item.title === rawLocation.title);
    this.showedLocations.splice(this.showedLocations.indexOf(locToRemove),1);
  }

  presentFilter() {
    this.showLocationList = !this.showLocationList;
  }

  presentSelector() {
    let modal = this.modalCtrl.create(MapLocationSelectorPage,
                  { locations: this.showedLocations, current: this.selectedLocation });
    modal.present();

    modal.onWillDismiss((data: any) => {
      if (data) {
        if(this.selectedLocation !== data){
          this.selectedLocation = data;
          this.mapService.moveCameraTo(this.selectedLocation);
          this.mapService.addMarker(this.selectedLocation.lat, this.selectedLocation.lng, this.selectedLocation.address, this.selectedLocation.title);
        }
      }
    });

  }

  public toggleMarker(title: string) {
    this.mapService.toggleMarker(title);
  }

}
