import { SubscriptionList } from "@/features/subscriptions/components/SubscriptionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { RecurringList } from "./RecurringList";

// Recurrentes (D107, D108): the services, yearly and other charges of the month, and the templates that create them
export function RecurringPage() {
  return (
    <Tabs defaultValue="month">
      <TabsList>
        <TabsTrigger value="month">Del mes</TabsTrigger>
        <TabsTrigger value="templates">Plantillas</TabsTrigger>
      </TabsList>
      <TabsContent value="month" className="mt-4">
        <SubscriptionList group="recurring" />
      </TabsContent>
      <TabsContent value="templates" className="mt-4">
        <RecurringList />
      </TabsContent>
    </Tabs>
  );
}
