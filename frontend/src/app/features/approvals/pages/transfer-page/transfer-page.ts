

import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

// දත්ත වල ව්‍යුහය (Interface)
interface TransferData {
  id: string;
  assetName: string;
  division: string;
  duration: string;
  requestedBy: string;
  assetNeedTo: string;
  reason: string;
  status: 'Incoming' | 'Active' | 'Pending' | 'Approved' | 'Completed' |'Transfered'|'Transfer'|'Confirmed'|'Incomming Confirmation';
  timeAgo: string;
  image?: string;
  type?: 'Incoming' | 'Outgoing'; // Active/Completed 
  daysLeft?: string; // Active 
  acceptedBy?: string; 
  assetOwner?: string;
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './transfer-page.html',
  styleUrl: './transfer-page.css'
})
export class TransferPageComponent implements OnInit {
  
  // (Default: incoming)
  activeTab = signal<'incoming' | 'pending' | 'active' | 'completed'>('incoming');

  // (Mock Data)
  //  Images data
  private allData = signal<TransferData[]>([
   
    // --- Incoming Requests (2) ---
  {
    id: 'AS001',
    assetName: 'Dell Laptop',
    division: 'HR Division',
    duration: '10 Aug 2025 - 25 Aug 2025',
    requestedBy: 'HR Division Head',
    assetNeedTo: 'Jenny Athapaththu (EST001)',
    reason: 'Software Development Project',
    status: 'Incoming',
    timeAgo: '10 minutes ago',
    type: 'Incoming',
    image: 'https://tse2.mm.bing.net/th/id/OIP.7L_Ho2CVPF-m88H7_UoM3AHaFS?pid=Api&P=0&h=220',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Jenny Athapaththu (EST001)'
  },
  {
    id: 'AS006',
    assetName: 'Canon Printer',
    division: 'IT Division',
    duration: '05 Aug 2025 - 20 Aug 2025',
    requestedBy: 'IT Division Head',
    assetNeedTo: 'Doe Fernando (EST007)',
    reason: 'Network Upgrade',
    status: 'Incoming',
    timeAgo: '2 hours ago',
    type: 'Incoming',
    image: 'https://tse2.mm.bing.net/th/id/OIP.U_KKE5Cp6OVgC8akAAmqPAHaHa?pid=Api&P=0&h=220',
    acceptedBy:'Sarah Dawson(EST009)',
    assetOwner:'Doe Fernando (EST007)'
  },
  

    // --- Pending Approval (3) ---
  {
    id: 'AS009',
    assetName: 'Epson Projector',
    division: 'Admin Division',
    duration: '01 Sep 2025 - 10 Sep 2025',
    requestedBy: 'Admin Head',
    assetNeedTo: 'Jane Wiliyam (EST011)',
    reason: 'Annual General Meeting',
    status: 'Pending',
    timeAgo: '5 hours ago',
    type: 'Incoming',
    image: 'https://mediaserver.goepson.com/ImConvServlet/imconv/d88e7473145d30509d3628e505b6dbc0214c5cf7/1200Wx1200H?use=banner&hybrisId=B2C&assetDescr=W55_W_STD_01',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Jane Wiliyam (EST011)'
  },
  {
    id: 'AS012',
    assetName: 'Office Chair',
    division: 'Finance',
    duration: '12 Sep 2025 - 30 Sep 2025',
    requestedBy: 'Finance Manager',
    assetNeedTo: 'Saman Kumara (EST045)',
    reason: 'New Recruit',
    status: 'Transfer',
    timeAgo: '1 day ago',
    type: 'Outgoing',
    image:'https://tse3.mm.bing.net/th/id/OIP.USiAakfD7Sa6dc9GPxKTbQHaHa?pid=Api&P=0&h=220',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Saman Kumara (EST045)'
  },
  {
    id: 'AS015',
    assetName: 'Apple iPad',
    division: 'Marketing',
    duration: '15 Sep 2025 - 20 Sep 2025',
    requestedBy: 'Marketing Lead',
    assetNeedTo: 'Ruwan Perera (EST089)',
    reason: 'Field Survey',
    status: 'Incomming Confirmation',
    timeAgo: '3 hours ago',
    type: 'Incoming',
    image: 'https://tse3.mm.bing.net/th/id/OIP.XuUW43B4jiGI3WjzcU_PWwHaHa?pid=Api&P=0&h=220',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Ruwan Perera (EST089)'
  },

  // --- Active Transfers (3) ---
  {
    id: 'AS020',
    assetName: 'Monitor 24"',
    division: 'IT Division',
    duration: '01 Aug 2025 - 01 Oct 2025',
    requestedBy: 'IT Lead',
    assetNeedTo: 'Kasun Dias (EST012)',
    reason: 'Dual Setup',
    status: 'Active', // Active tab ekata 'Incoming' saha 'Outgoing' status deka gannawa
    timeAgo: 'Active Now',
    type: 'Incoming',
    daysLeft: '25 days remaining',
    image: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/e-series/e2425hsm/media-gallery/monitor-dell-pro-e2425hsm-bk-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=868&qlt=100,1&resMode=sharp2&size=868,804&chrss=full',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Kasun Dias (EST012)'
  },
  {
    id: 'AS022',
    assetName: 'Scanner X2',
    division: 'HR Division',
    duration: '10 Aug 2025 - 15 Sep 2025',
    requestedBy: 'HR Manager',
    assetNeedTo: 'Nimali Siriwardena (EST022)',
    reason: 'Document Digitization',
    status: 'Active',
    timeAgo: 'Active Now',
    type: 'Outgoing',
    daysLeft: '12 days remaining',
    image: 'https://mediaserver.goepson.com/ImConvServlet/imconv/e381a1e16d14618eb2c208abe70e26c894553c9a/1200Wx1200H?use=banner&hybrisId=B2C&assetDescr=FY22_SCN_V39II_02Photo',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Nimali Siriwardena (EST022)'
  },
  {
    id: 'AS025',
    assetName: 'Webcam 4K',
    division: 'Executive',
    duration: '20 Aug 2025 - 20 Dec 2025',
    requestedBy: 'CEO Office',
    assetNeedTo: 'Piyal Silva (EST002)',
    reason: 'Video Conferencing',
    status: 'Active',
    timeAgo: 'Active Now',
    type: 'Incoming',
    daysLeft: '90 days remaining',
    image: 'https://m.media-amazon.com/images/I/61CGvHphrrL._AC_.jpg',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Piyal Silva (EST002)'
  },

  // --- Completed Transfers (4) ---
  {
    id: 'AS101',
    assetName: 'Conference Mic',
    division: 'Admin',
    duration: '01 Jul 2025 - 05 Jul 2025',
    requestedBy: 'Admin Head',
    assetNeedTo: 'Staff Room',
    reason: 'Workshop',
    status: 'Completed',
    timeAgo: 'Completed on 05 Jul',
    type: 'Incoming',
    image: 'https://tse1.mm.bing.net/th/id/OIP.PYYetNBAsJApNmiwOof49wHaFR?pid=Api&P=0&h=220',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Saman Kumara (EST045)'
  },
  {
    id: 'AS105',
    assetName: 'Projector Screen',
    division: 'Training',
    duration: '10 Jul 2025 - 12 Jul 2025',
    requestedBy: 'Training Lead',
    assetNeedTo: 'Hall A',
    reason: 'Staff Training',
    status: 'Completed',
    timeAgo: 'Completed on 12 Jul',
    type: 'Outgoing',
    image: 'https://tse1.mm.bing.net/th/id/OIP.vTX7YEF-ZTTFkY6_LkYfuwHaHZ?pid=Api&P=0&h=220',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Ruwan Perera (EST089)'
  },
  {
    id: 'AS110',
    assetName: 'External HDD',
    division: 'IT Dept',
    duration: '15 Jul 2025 - 20 Jul 2025',
    requestedBy: 'IT Support',
    assetNeedTo: 'Backup Server Room',
    reason: 'Data Backup',
    status: 'Completed',
    timeAgo: 'Completed on 20 Jul',
    type: 'Incoming',
    image: 'https://tse2.mm.bing.net/th/id/OIP.KmpJ_8lr1FWGFoTPFCUEJAHaHa?pid=Api&P=0&h=220',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Kasun Dias (EST012)'
  },
  {
    id: 'AS115',
    assetName: 'UPS 10kVA',
    division: 'Maintenance',
    duration: '01 Jun 2025 - 30 Jun 2025',
    requestedBy: 'Engineer',
    assetNeedTo: 'Server Room',
    reason: 'Power Maintenance',
    status: 'Completed',
    timeAgo: 'Completed on 30 Jun',
    type: 'Outgoing',
    image: 'https://5.imimg.com/data5/SELLER/Default/2024/6/425614788/OC/LS/QA/6651995/eaton-10-kva-ups-1000x1000.jpg',
    acceptedBy:'Seleena Fernando(EST008)',
    assetOwner:'Nimali Siriwardena (EST022)'
  }


  ]);

showMenu = false;
  // Filter state එක සඳහා signal එකක් (Default එක 'all')
filterType = signal<'all' | 'Incoming' | 'Outgoing'>('all');
searchQuery = signal<string>('');

// filteredResults computed logic එක ඇතුළත මේ කොටස update කරන්න
filteredResults = computed(() => {
  const tab = this.activeTab();
  const typeFilter = this.filterType();
  const query = this.searchQuery().toLowerCase().trim();
  let data = this.allData();

  // මුලින්ම Tab එක අනුව filter කරන්න
  if (tab === 'incoming') data = data.filter(i => i.status === 'Incoming');
  else if (tab === 'pending') data = data.filter(i => i.status === 'Pending' || i.status === 'Transfer' ||i.status === 'Transfered' || i.status === 'Confirmed' || i.status === 'Incomming Confirmation');
  else if (tab === 'active') data = data.filter(i => i.status === 'Active');
  else if (tab === 'completed') data = data.filter(i => i.status === 'Completed');

  // දැන් Incoming/Outgoing filter එක apply කරන්න (Active/Completed tabs වලදී පමණක්)
  if ((tab === 'active' || tab === 'completed') && typeFilter !== 'all') {
    data = data.filter(item => item.type === typeFilter);
  }

  if (query) {
    data = data.filter(item => 
      item.assetName.toLowerCase().includes(query) || 
      item.id.toLowerCase().includes(query)
    );
  }

  return data;
});

onSearchChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.searchQuery.set(value);
}

// Filter එක change කරන function එක
setFilterType(type: 'all' | 'Incoming' | 'Outgoing') {
  this.filterType.set(type);
}



  // Summary Counts (Card වල පෙන්වීමට)
  incomingCount = computed(() => this.allData().filter(i => i.status === 'Incoming').length);
  pendingCount = computed(() => this.allData().filter(i => i.status === 'Pending' || i.status === 'Approved').length);
  activeCount = computed(() => this.allData().filter(i => i.status === 'Active').length);
  completedCount = computed(() => this.allData().filter(i => i.status === 'Completed').length);

  ngOnInit(): void {
    // Component එක Load වන විට කළ යුතු දේ මෙහි දැක්විය හැක
  }

  // Tab එක මාරු කරන Function එක
  setTab(tab: 'incoming' | 'pending' | 'active' | 'completed') {
    this.activeTab.set(tab);
  }

  // Actions
  onAccept(id: string) {
    console.log('Accepted asset transfer:', id);
    // මෙහිදී API call එකක් මගින් status update කළ හැක
  }

  onReject(id: string) {
    console.log('Rejected asset transfer:', id);
  }
}
