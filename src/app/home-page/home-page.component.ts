import { Component, Inject, OnInit } from '@angular/core';
import { PopupService } from '../shared/services/popup.service';
import { FirebaseService } from '../shared/services/firebase.service';

import { typeWithParameters } from '@angular/compiler/src/render3/util';
import { ActivatedRoute, Params } from '@angular/router';
import { DevelopHelp } from '../shared/services/develop-help.service';
// import { ZoomService } from '../shared/services/zoom.service';
// import { zoomConfig } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import Swiper, { Navigation, Pagination, SwiperOptions} from 'swiper';
import { environment } from 'src/environments/environment';
import { AlfaAcquiringService } from '../shared/services/alfa-acquiring.service';
import axios, { Axios } from 'axios';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass']
})
export class HomePageComponent implements OnInit {
  
  production = environment.production
  FBUser = null
  doctors = []
  testIndex = 0

  config: SwiperOptions = {
    spaceBetween: 150,
    slidesPerView: "auto",
    initialSlide: 0,
    autoplay: {
      delay: 1000,
      pauseOnMouseEnter: true
    },
    loop: true,
    pagination: { 
      type: 'bullets',
      clickable: true,
     },
    navigation: true,
  }

  

  activeSlide = 0
  promoSlides = [
    {
      src: "/assets/img/home-slider-0.jpg",
      sign: "Дистанционное решение проблем детского развития"
    },
    {
      src: "/assets/img/home-slider-1.jpg",
      sign: "Думаете, онлайн занятия - скучно и не продуктивно?"
    },
    {
      src: "/assets/img/home-slider-2.jpg",
      sign: "Мы ценим юмор и креатив"
    },
    {
      src: "/assets/img/home-slider-3.jpg",
      sign: "И поэтому видим радость в глазах наших учеников"
    },
  ]

  testUrls = ['https://image.shutterstock.com/image-vector/img-file-document-icon-260nw-1356823577.jpg','https://image.shutterstock.com/image-vector/img-file-document-icon-260nw-1363854290.jpg']
  
  constructor(
    public popupService: PopupService,
    private firebase: FirebaseService,
    private alfaAcquiring: AlfaAcquiringService,
    private activatedRoute: ActivatedRoute,
    public helper: DevelopHelp,
    private http: HttpClient
    
    ) { 
      
    }

  ngOnInit(): void {
    // this.doctors = []
    this.FBUser = this.firebase.currentUser
    // this.FBUser = this.firebase.auth().currentUser

    this.getAllDoctors()
    this.checkQuerry()
    Swiper.use([Navigation, Pagination])
  }
  
  

  
 

  initSwiper() {

  }

  onSwiper(swiper) {
    // console.log(swiper)
  }

  onSlideChange() {
    // console.log("change")
  }

  FBtest() {
    this.firebase.testEmailFunction()
      .then((res) => {
        console.log("ура : ", res)
      })
      .catch((err) => {
        console.log("Ошибка FBtest: ", err)
        console.log(err.code)
        console.log(err.message)
        console.log(Object.entries(err) )
      })
  }

  FBLogout() {
    this.firebase.signOut()
    .then((resp) => {
      console.log("FB sign out")
    })
    .catch((err) => {
      console.log("FB sign out ERROR: ", err)
    })
  }

  FBnumber() {
    this.firebase.testFunctionRandom()
      .then((resp) => {
        console.log("число: ", resp)
      })
      .catch((err) => {
        console.log("ERROR: ", err)
      })
  }

  queryTest() {
    this.firebase.testQuery().subscribe(
      (resp) => {console.log("query: ", resp)},
      (err) => {console.log("error: ", err)}
    )
    
  }
  
  FBdisplayUser() {
    console.log("currentUser: ", this.firebase.currentUser)
  }

  FBLogIn() {
    // this.firebase.signInWithPassNew(user)
    //   .then((result) => {
    //     console.log("firebase.signInWithPass: ", result);
    //     this.form.reset()
    //     this.loggingIn = false
    //     // this.popupService.toggleLoginPopup()
    //     // this.router.navigate(['/profile'])
    //     // this.loggingIn = false
    //   })
    //   .catch((err) => {
    //     console.log("ошибка входа чз firebase: ", err);
    //     this.loggingIn = false
    //   })
  }

  FBdIsAuth() {
    console.log(this.firebase.isAuthenticated())
  }

  alfaAll() {
    this.firebase.testGetAlfaAll("getLastOrdersForMerchants.do", false).subscribe(
      (resp) => {console.log("allAlfa: ", resp)},
      (err) => {console.log("allAlfa error: ", err)})
  }

  ACQtest() {
    // console.log(this.firebase.testAlfa())
    this.firebase.testAlfaREST()
    
    .subscribe(
      (resp) => {console.log("++", resp)},
      (err) => {console.log("--", err)})
      // .then( resp => console.log("альфа успех: ", resp))
      // .catch( err => console.log("альфа ошибка: ", err))
    
    // .then((resp) => {
    //   console.log("альфа: " ,resp)
    // })
    // .catch((err) => {
    //   console.log("ERROR альфа:", err)
    // })


    // const url = "https://web.rbsuat.com/ab_by/rest/register.do"
    // const data = {
    //     userName: "logogo.online-api",
    //     password: "HnnlT8Et",
    //     orderNumber: "2021_6_16_18_dawRBLNTpDV5gep3mG9TyGAACrE3",
    //     amount: "1000",
    //     returnUrl: "https://logogo.online"
    // }
    // axios.post(url, data)
    //   .then( resp => console.log("ура: ", resp))
    //   .catch( err => console.log("((((: ", err))
    
    
  }

  authTest() {
    const data = {
      urlEnd: "getOrderStatusExtended.do"
    }
    this.firebase.authFuncTest(data)
    .then((resp) => {
      console.log("✔️auth: ", resp)
    })
    .catch((err) => {
      console.log("❌auth: ", err)
    })
  }

  


  checkQuerry() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params["mode"] ) {
        // this.firebase.applyActionCode(params["oobCode"])
        // console.log(`dectected: ${params["mode"]} mode`);
        // this.applyFirebaseCodes(params["mode"], params["oobCode"], params["apiKey"])
        this.popupService.toggleFbSecurityPopup()
      } 
    })
  }

  

  // testSignIn() {
  //   const user = {
  //     email: "test5@mail.ru",
  //     password: "123456"}
  //   this.firebase.signInWithPass(user)
  // }

  getAllDoctors() {
    this.firebase.getDoctorsInfo()
    .subscribe((resp) => {
      // console.log("все пользователи: ", resp);
      this.sortDoctors(resp)
    },
    (err) => {
      console.log("ошибка при получении докторов ", err);
    }) 
  }

  sortDoctors(users) {
    // let doctors = []
    for (const property in users) {
      // console.log("проверка пользователя:" ,users[property]);
      if (users[property].userType === "doctor" && users[property].zoomLink && users[property].weeklySchedule) { 
        users[property].id = property;
        this.doctors.push(users[property])
      }
    }
    console.log("доктора: ", this.doctors);
    // console.log("длина: ", this.doctors.length);
    // console.log("val: ", Object.values(this.doctors))
  }


  
}
