import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { emailConfig, environmentOther } from 'src/environments/environment';
import { AuthService } from '../shared/services/auth.service';
import { FirebaseService } from '../shared/services/firebase.service';
import { PopupService } from '../shared/services/popup.service';
import { TelegramBotService } from '../shared/services/telegram-bot.service';

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.sass']
})
export class FeedbackPageComponent implements OnInit {

  requiredErr = false

  clientForm = new FormGroup({
    childName: new FormControl('', [
      Validators.required,
    ]),
    childDate: new FormControl('', [
      Validators.required,
    ]),
    parentName: new FormControl('', [
      Validators.required,
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    comment: new FormControl('', [
      Validators.required,
    ]),
  });

  get childName() {return this.clientForm.get('childName')}
  get childDate() {return this.clientForm.get('childDate')}
  get parentName() {return this.clientForm.get('parentName')}
  get email() {return this.clientForm.get('email')}
  get phone() {return this.clientForm.get('phone')}
  get comment() {return this.clientForm.get('comment')}

  constructor(
    public popupService: PopupService,
    private authServise: AuthService,
    private firebase: FirebaseService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private telegram: TelegramBotService,
  ) { }

  ngOnInit(): void {
    
  }

  onSubmit() {
    console.log(this.clientForm.value)

    this.requiredErr = false
    
    if (this.clientForm.invalid) {
      this.requiredErr = true
    }
    // this.isSendingData = true
    // this.ErrMessage = ""
    
    // let feedbackForm = {
    //   to: this.form.value.email,
    //   from: emailConfig.fromEmailAdress,
    //   templateId: emailConfig.EMAIL_TEMPLATES.MAIN_PAGE_FEEDBACK,
    //   dynamicTemplateData: {
    //     subject: "Logogo",
    //   }
    // }
    
    
    
    // if (this.form.invalid) {
    //   console.log(this.form)
    //   this.ErrMessage = "форма заполнена не полностью"
    //   // this.showRulesRequired = true
    //   this.isSendingData = false
    //   return
    // }

    // let sendingData = this.form.value
    // sendingData.dob = this.reformatDate(sendingData.dob) // 2010-12-30 -> 30.12.2010
    // console.log(sendingData)
    
    // Promise.resolve(this.telegram.sendClientFeedback(sendingData))
    // .then((resp) => {
    //   this.firebase.sendEmailFunction(feedbackForm)
    //     .then((res) => {
    //       console.log("email отправлен: ", res)
    //       this.form.reset()
    //       this.isSendingData = false
    //       this.submitted = true
    //       setTimeout(() => this.submitted = false, 5000)
    //     })
    //     .catch((err) => {
    //       console.log("Ошибка FBtest: ", err)
    //       this.isSendingData = false
    //     })
    // })
  }

  reformatDate(dateStr) {
    const dArr = dateStr.split("-");  // ex input "2010-01-18"
    return dArr[2] + "." + dArr[1]+ "." + dArr[0]; //ex out: "18.01.10"
  }

}
