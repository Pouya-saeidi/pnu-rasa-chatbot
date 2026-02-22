from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


class ActionCourseInfo(Action):
    def name(self) -> Text:
        return "action_course_info"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        # ۱) گرفتن اسم درس از slot
        course_name = tracker.get_slot("course_name")

        if not course_name:
            dispatcher.utter_message(text="اسم درس رو متوجه نشدم، دوباره بگو.")
            return []

        # ۲) تبدیل فاصله‌ها به _
        safe_name = course_name.replace(" ", "_")

        # ۳) ساختن نام response
        response_name = f"utter_course_info_{safe_name}"

        # ۴) اگر چنین templateی توی domain تعریف شده بود:
        if "responses" in domain and response_name in domain["responses"]:
            dispatcher.utter_message(response=response_name)
        else:
            # fallback اگر کلید پیدا نشد
            dispatcher.utter_message(
                text=f"برای درس «{course_name}» هنوز منبعی ثبت نکردم."
            )

        return []
