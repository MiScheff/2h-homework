import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Ticket } from 'src/interfaces/ticket.interface';
import { User } from 'src/interfaces/user.interface';
import { BackendService } from '../backend.service';

@UntilDestroy()
@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  public readonly users$: Observable<User[]> = this.backendService.users();
  public readonly tickets$: Observable<Ticket[]> = this.backendService.tickets();
  
  temp = [];
  rows = [];
  columns = [];

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('hdrTpl', { static: true }) hdrTpl: TemplateRef<any>;
  @ViewChild('editTmpl', { static: true }) editTmpl: TemplateRef<any>;
  @ViewChild('assignModal', { static: true }) assignModal: TemplateRef<any>;
  @ViewChild('ticketModal', { static: true }) ticketModal: TemplateRef<any>;

  ColumnMode = ColumnMode;

  closeModal: string;
  ticketIdSelect: number;

  constructor(private readonly backendService: BackendService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.tickets$
      .pipe(untilDestroyed(this))
      .subscribe(tickets => {
        console.log('NOMINAL', tickets);
        
        this.temp = [...tickets]
        this.rows = tickets;
      });

    this.columns = [
      {
        cellTemplate: this.editTmpl,
        headerTemplate: this.hdrTpl,
        name: 'Id'
      },
      {
        cellTemplate: this.editTmpl,
        headerTemplate: this.hdrTpl,
        name: 'Description'
      },
      {
        cellTemplate: this.editTmpl,
        headerTemplate: this.hdrTpl,
        name: 'assigneeId'
      },
      {
        cellTemplate: this.editTmpl,
        headerTemplate: this.hdrTpl,
        name: 'Status'
      },
      {
        cellTemplate: this.editTmpl,
        headerTemplate: this.hdrTpl,
        name: ''
      }
    ];
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.description.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  openAssignModal(ticketId: number): void {
    this.ticketIdSelect = ticketId;
    this.modalService.open(this.assignModal, {ariaLabelledBy: 'modal-basic-title'}).result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    }, (res) => {
      this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
    });
  }

  openAddTicketModal(): void {
    this.modalService.open(this.ticketModal, {ariaLabelledBy: 'modal-basic-title'}).result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    }, (res) => {
      this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
    });
  }
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  assign(userId: number): void {
    this.backendService.assign(this.ticketIdSelect, userId)
      .pipe(untilDestroyed(this))
      .subscribe({
        complete: () => {
          this.modalService.dismissAll();
        },
        error: (err) => {
          console.error('Erreur lors de l\'assignement', err);
        }
      });
  }

  complete(ticketId: number): void {
    console.log(this.rows.find(ticket => ticket.id === ticketId).completed);
    
    this.backendService.complete(ticketId, !(this.rows.find(ticket => ticket.id === ticketId).completed))
      .pipe(untilDestroyed(this))
      .subscribe({
        complete: () => {
        },
        error: (err) => {
          console.error('Erreur lors de la complétion', err);
        }
      });
  }

  addTicket(description): void {
    this.backendService.newTicket({ description: description.value })
      .pipe(untilDestroyed(this))
      .subscribe({
        complete: () => {
          this.modalService.dismissAll();
          console.log('ADD', this.rows);
          
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du ticket', err);
        }
      })
  }

}
