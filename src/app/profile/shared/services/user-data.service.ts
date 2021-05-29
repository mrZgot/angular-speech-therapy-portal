import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserClient, UserDoctor, AnyUser, UserDbInfo } from 'src/app/shared/interfaces';
import { tap } from 'rxjs/operators';
import { DebugHelper } from 'protractor/built/debugger';
import { DevelopHelp } from 'src/app/shared/services/develop-help.service';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { PopupService } from 'src/app/shared/services/popup.service';

@Injectable()

export class UserData {


   myData: UserDbInfo = {
      name: "",
      surname: "",
      patronymic: "",
      userType: "client",
      description: "",
      // sertificatesLinks: [],
      // sertificatesNames: []
   }

   constructor(
      private helper: DevelopHelp,
      private auth: AuthService,
      private http: HttpClient,
      private firebase: FirebaseService,
      private popupService: PopupService
   ) {}


   initialization() {
      this.getMyData()
      .subscribe(
         (response: UserDbInfo) => {
            this.helper.toConsole("Инициализация пользователя: ",response)
            this.changeMyLocalData(response)
            if (this.myData.userType === "doctor") {
               this.getSertificates()
               this.checkMyLessons()
            } else if (this.myData.userType === "client") {
               if (this.myData.events) {
                  this.makeDatesOfEventsObject()
               }
            }
         },
         (err) => {
            console.log("ERROR: getting data from server");
         })
   }


   getMyData() {
      return this.http.get(`${environment.FbDbUrl}/users/${localStorage.getItem("user-Id")}.json`)
   }
   
   checkMyLessons() {
      this.firebase.getAllLessons()
         .subscribe((resp) => {
            // console.log("все ивенты тут: ",resp)
            // console.log("!!!!!!",resp )
            const allLessonsArray = Object.entries(resp) //делаем массив всех уроков [[id, data],[id, data]],...
            const myLessonsIdsFromServer = allLessonsArray.filter((item) => {
               const lessonIdParseArray = item[0].split("_"); //разделяем каждый Id урока на слова
               //*оставить если id пользователя == последней части id ивента
               return localStorage.getItem("user-Id") == lessonIdParseArray[lessonIdParseArray.length - 1]
            })
            // console.log(myLessonsIdsFromServer)
            //* проверка данных пользователя на наличие этих уроков в себе
            let newLessonsFound = false 
            let newLessonsToSend = {}
            if (!this.myData.events && myLessonsIdsFromServer) {
               this.myData.events = {} //*проверка, есть ли объект lessons в юзере
               newLessonsFound = true
               console.log("не было уроков в данных")
            }
            for(let lessonId of myLessonsIdsFromServer) {
               if (!this.myData.events[lessonId[0]]) { //*проверка, по каждому уроку
                  this.myData.events[lessonId[0]] = resp[lessonId[0]]
                  newLessonsToSend[lessonId[0]] = resp[lessonId[0]]
                  newLessonsFound = true
                  console.log("найден новый урок", this.myData.events[lessonId[0]])
               }
            }
            if(newLessonsFound) {
               this.sendMyLessonsDataChanges(newLessonsToSend)
               .subscribe((resp) => {
                  console.log("новые уроки найдены и записаны в ячейку", resp)
               },
               (err) => {
                  console.log("Ошибка записи новых уроков: ", err)
               })
            } else {
               console.log("новых уроков не обнаружено")
            }
            this.makeDatesOfEventsObject()
            
         },
         (err) => {
            console.log("ошибка. не удалось найти ивенты", err)
         })
   }

   makeDatesOfEventsObject() {
      this.myData.eventsDates = {}
      // console.log(Object.assign(this.myData.events))
      // console.log(this.myData.events)
      let lessonsDates = {} 
      for(let lessonObj in this.myData.events) {
         const thisDate = this.myData.events[lessonObj].date
         const thistime = this.myData.events[lessonObj].time
         const newLessonTime = {
            [thisDate.year]: { //= создание объекта year-month-day-time
               [thisDate.month]: {
                  [thisDate.day]: {
                     [thistime]: {}
                  }
               }
            }
         }
         //= слияние нового объекта m(newLessonTime) и основного (lessonsDates)
         if (!lessonsDates[thisDate.year]) lessonsDates[thisDate.year] = {}
         if (!lessonsDates[thisDate.year][thisDate.month]) lessonsDates[thisDate.year][thisDate.month] = {}
         if (!lessonsDates[thisDate.year][thisDate.month][thisDate.day]) lessonsDates[thisDate.year][thisDate.month][thisDate.day] = {}
         if (!lessonsDates[thisDate.year][thisDate.month][thisDate.day][thistime]) lessonsDates[thisDate.year][thisDate.month][thisDate.day][thistime] = {
            patientName: this.myData.events[lessonObj].patientName,
            doctorName: this.myData.events[lessonObj].doctorName,
            problemDescription: this.myData.events[lessonObj].problemDescription
         }
      }
      this.myData.eventsDates = lessonsDates
      // console.log("!!!!!",this.myData)
      // this.myData.eventsDates[]
      // console.log(this.myData)
   }

   getSertificates() {
      this.firebase.getSertificatesList()
         .then((files) => {
            console.log("мои файлы", files.items)

            this.saveSertificatesNames(files.items)
            

            
            this.firebase.getDownloadLinks(files.items)
            .then((links) => {
               // console.log("полученные ссылки на скачку: ", links)
               this.myData.sertificatesLinks = links
            })
            
            
         })
         .catch((err) => {
            console.log("мои файлы не найдены: ", err);
         })
   }

   saveSertificatesNames(sertificates) {
      this.myData.sertificatesNames = []
      for (let file in sertificates) {
         if (!isNaN(+file)) {
            // console.log("добавление ", sertificates[file].name);
            
            this.myData.sertificatesNames[file] = (sertificates[file].name)
         }
      }
      console.log("мои сертификаты: ", this.myData.sertificatesNames);
   }

   changeMyLocalData(userData: UserDbInfo) {
      this.myData = userData
   }


   // checkEmailVerify() {
   //    // console.log(this.myData.emailVerified);
   //    if (this.myData.emailVerified === undefined) {
   //       console.log("myData.emailVerified не найдено");
   //       this.myData.emailVerified = false
   //       const newData = {
   //          emailVerified: false,
   //       }
   //       this.sendMyDataChanges(newData)
   //       .subscribe((resp) => {
   //          console.log("добавлено поле emailVerified = false")
   //          this.popupService.emailVerifyPopup = true
   //       })
   //    } else if (this.myData.emailVerified === false) {
   //       console.log("myData.emailVerified: false");
   //       this.popupService.emailVerifyPopup = true
   //    } else if (this.myData.emailVerified === true) {
   //       console.log("myData.emailVerified: true");
   //       this.popupService.emailVerifyPopup = false
   //    }
   // }

   sendMyDataChanges(newUserData) {
      // let firebaseUserType
      // if (userType == "client") firebaseUserType = "patients"
      // else firebaseUserType = "doctors"
      return this.http.patch(`${environment.FbDbUrl}/users/${localStorage.getItem("user-Id")}.json`, newUserData)
   }

   sendMyLessonsDataChanges(newLessonData) {
      // let firebaseUserType
      // if (userType == "client") firebaseUserType = "patients"
      // else firebaseUserType = "doctors"
      return this.http.patch(`${environment.FbDbUrl}/users/${localStorage.getItem("user-Id")}/events.json`, newLessonData)
   }


}