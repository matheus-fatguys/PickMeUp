import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

declare var FCMPlugin;
@Injectable()
export class NotificacaoProvider {
  applicationServerPublicKey ='AAAAbzVHhtA:APA91bFNU44_U-dCe8SV50-WkY3XxgxkGSgRUFNO190IXxyHRIkaTVAbRFAd8TaIGznPL58VyWKhKs_gZpdEHR5ECGXF8fbrMzFjfCLhe3Bzc0KHDM7qkWpQruu4gcyb3mt2GCPkruk0';
  constructor(public platform: Platform) {
   
  }

  inicarNotificacoes(){
    this.platform.ready().then(() => {
      if(typeof(FCMPlugin) !== "undefined"){
        FCMPlugin.getToken(function(t){
          console.log("Use this token for sending device specific messages\nToken: " + t);
        }, function(e){
          console.log("Uh-Oh!\n"+e);
        });

        FCMPlugin.getToken(
          (t) => {
            console.log("FCMPlugin.getToken");
            console.log(t);
          },
          (e) => {
            console.log(e);
          }
        );

        FCMPlugin.onNotification(function(d){
          if(d.wasTapped){  
            // Background recieval (Even if app is closed),
            //   bring up the message in UI
            console.log("recebeu notificação BACKGROUND");
          } else {
            // Foreground recieval, update UI or what have you...
            console.log("recebeu notificação FOREGROUND");
          }
        }, function(msg){
          // No problemo, registered callback
          console.log("msg: "+msg);
          console.log(msg);
        }, function(err){
          console.log("Arf, no good mate... " + err);
          console.error(err);
        });
      } 
      else {
        console.log("Notifications disabled, only provided in Android/iOS environment");
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            console.log('Service Worker and Push is supported');
        } 
        else {
          console.warn('Push messaging is not supported');
        }
      }
    });
  }

}
