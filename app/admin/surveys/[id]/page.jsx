export const instant = false;

import EditSurveyClient from "./EditSurveyClient";

export default async function EditSurveyPage({ params }) {
  const { id } = await params;
  return <EditSurveyClient id={id} />;
}
