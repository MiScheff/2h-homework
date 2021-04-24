import { TicketDetailsComponent } from "./ticket-details/ticket-details.component";
import { TicketListComponent } from "./ticket-list/ticket-list.component";

export const routes = [
	{
		path: '',
		redirectTo: 'tickets',
		pathMatch: 'full'
	},
	{
		path: 'tickets',
		component: TicketListComponent
	},
	{
		path: 'tickets/:id',
		component: TicketDetailsComponent
	}
]