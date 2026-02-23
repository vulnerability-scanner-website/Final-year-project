import React from "react";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";

export default function page() {
  return (
    <div>
      <Calendar>Calendar</Calendar>
      <Button>Add</Button>
    </div>
  );
}
