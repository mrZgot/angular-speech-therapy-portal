import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from 'src/environments/environment';
import { FirebaseService } from '../shared/services/firebase.service';

@Component({
  selector: 'app-payment-check-page',
  templateUrl: './payment-check-page.component.html',
  styleUrls: ['./payment-check-page.component.sass']
})
export class PaymentCheckPageComponent implements OnInit {

  production = environment.production

  paySuccess = ""
  dbPaymentConfirmed = false
  token = ""

  constructor(
    private activatedRoute:ActivatedRoute,
    private firebase: FirebaseService
  ) { }

  ngOnInit(): void {
    const checkQueryParams = setInterval(() => {
      this.activatedRoute.queryParams.subscribe((params: Params) => {
        console.log("params:", params)
        if (params["paySuccess"] && params["paySuccess"]) {
          this.paySuccess = params["paySuccess"] == "true" ? "true" : "fail"
          this.token = params["token"]
          console.log("params[paySuccess]:", params["paySuccess"])
          this.checkOrderDBstatus()
          clearInterval(checkQueryParams)
        }
      })
    }, 200)
  }

  checkOrderDBstatus() {
    const funcData = {token: this.token}
    const checkOrderDBstatusInterval = setInterval(async () => {
      await this.firebase.reqFunc("orders-checkOrderStatus", funcData).subscribe(
        (resp: any) => {
          console.log("status: ", resp.orderState)
          if (resp.orderState === "PaymentConfirmed") {
            this.dbPaymentConfirmed = true
            clearInterval(checkOrderDBstatusInterval)
          }
        },
        (err) => {
          console.log("ERROR checkOrderStatus: ", err)
        })
    }, 2000)
  }

  testToken() {
    this.firebase.reqFunc("orders-checkOrderStatus", {token: "0acc06ab-fcc8-4697-a6cd-73bba75dad8e"})
      .subscribe(
        (resp) => {
          console.log("status: ", resp)
        },
        (err) => {
          console.log("ERROR checkOrderStatus: ", err)
        })
  }

}
