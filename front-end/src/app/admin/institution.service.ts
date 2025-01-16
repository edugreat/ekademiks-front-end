import { Injectable } from '@angular/core';
import { Endpoints } from '../end-point';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  
  

  private _region: Map<string, string[]> = new Map();

  constructor(private urlEndpoints:Endpoints, private http:HttpClient) {

    this.populateRegion();
   }



   registerInstitution(institution: Institution):Observable<HttpResponse<number>> {

    return this.http.post<HttpStatusCode>(this.urlEndpoints.newRegistrationUrl, institution, {'observe':"response"})
   
  }

  getRegisteredInstitutions(adminId: number):Observable<Institution[]> {

   return this.http.get<Institution[]>(this.urlEndpoints.institutionsUrl, { headers:{'adminId':`${adminId}`}});

  }

  addStudentRecords(selectedInstitution: number, records: any[]):Observable<HttpResponse<number>> {

    return this.http.post<HttpStatusCode>(this.urlEndpoints.addStudent_Records, records, {
      headers:{
        'institutionId':`${selectedInstitution}`
      },
      'observe':'response'
    })
   

  }
  


  private populateRegion(): void {

    const states: string[] = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara','FCT'];

    const LGAs: string[][] = [

     /* Abia */ ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umunneochi'],
     /* Adamawa */ ['Demsa', 'Fombina', 'Ganye', 'Gombi', 'Guyuk', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
     /* Akwa Ibom */ ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom', 'Ika', 'Ikono', 'Ikot Ekpene', 'Ikot Abasi', 'Ikot', 'Ini', 'Itu', 'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung Uko', 'Ukanafun', 'Uruan', 'Urueffong Orouko'],
    /* Anambra */ ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
     /* Bauchi*/ ['Alkaleri', 'Bauchi', 'Bogoro', 'Dass', 'Darazo', 'Damban', 'Disina', 'Dukul', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
     /* Bayelsa*/ ['Alkaleri', 'Bauchi', 'Bogoro', 'Dass', 'Darazo', 'Damban', 'Disina', 'Dukul', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
     /* Benue */ ['Agatu', 'Apa', 'Ado', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
     /* Borno */ ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
     /* Cross River */['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur'] ,
     /* Delta */ ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'] ,
     /* Ebonyi */ ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
     /* Edo */ ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Orhionmwon', 'Oredo', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
     /* Ekiti */ ['Ado Ekiti', 'Aiyekire', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
     /* Enugu */ ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Igbo-Eze North', 'Igbo-Eze South', 'Isi-Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo-Uwani'],
     /* Gombe */ ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada/Bazza', 'Shomgom', 'Yamaltu/Deba'],
     /* Imo */ ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte Mbaise', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'],
     /* Jigawa */ ['Auyo', 'Babura', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kaura Namoda', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
     /* Kaduna */ ['Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
       /* Kano */ ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garum Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Municipal', 'Nassarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Shira', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
      /* Katsina */ ['Bakori', 'Batagarawa', 'Batsari', 'Bauchi', 'Charanchi', 'Dandume', 'Danja', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Ruru', 'Safana', 'Sandamu', 'Zango'],
     /* Kebbi*/ ['Aleiro', 'Argungu', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Tahoua', 'Yauri', 'Zuru'],
     /* Kogi */ ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela/Odolu', 'Ijumu', 'Kogi', 'Lokoja', 'Mopa-Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
     /* Kwara */ ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Oke Ero', 'Offa', 'Ogun', 'Olorun', 'Pategi', 'Patigi'],
     /* Lagos */ ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
     /* Nasarawa */ ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Eggon', 'Obi', 'Toto', 'Wamba'],
     /* Niger */ ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Munya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tagawa', 'Wushishi'],
     /*Ogun*/ ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Ipokia', 'Obafemi/Owode', 'Ogun Waterside', 'Remo North', 'Remo South', 'Shagamu'],
      /* Ondo */ ['Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Idanre', 'Ifedore', 'Ilaje', 'Ile-Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
     /* Osun */ ['Aiyedade', 'Aiyedire', 'Atakunmosa East', 'Atakunmosa West', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Obokun', 'Odo Otin', 'Ola-Oluwa', 'Olorunda', 'Oriade', 'Osogbo'],
     /* Oyo */ ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo-Oluwa', 'Olorunsogo', 'Oluyole', 'Ona-Ara', 'Orelope', 'Oriire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
     /* Plateau */ ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Shendam', 'Wase'],
      /* Rivers */ ['Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Kogi/Bori', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Port Harcourt', 'Tai'],
      /* Sokoto */ ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamakko', 'Wurno', 'Yabo'],
      /* Taraba */ ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro'],
      /* Yobe */ ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
      /* Zamfara */ ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gusau', 'Gummi', 'Gusumi', 'Kaura Namoda', 'Kiyaw', 'Maradun', 'Marfa', 'Marrum', 'Shinkafi', 'Talata Mafara', 'Tsafe', 'Zurmi'],
     /* FCT */ ['Abaji',  'Abuja Municipal Area Council(AMAC)', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali']

    ]


    for (let index = 0; index < states.length; index++) {
     
      this._region.set(states[index], LGAs[index]);
      
    }

  }

  public get states():string[]{

    return [...this._region.keys()];
  }

  public getLGA(state:string):string[] | undefined{

    return this._region.get(state);
  }
}

// an object of Institution (especially secondary school with basic information required to register it on the app)
export interface Institution {

  id:number,
  name:string,
  createdOn?:Date,
  state?:string,
  localGovt?:string,
  createdBy?:number,
  students?:string[],
  studentPopulation?:number

}
