from openai import OpenAI
import os
from dotenv import load_dotenv


load_dotenv()

client = OpenAI(
  base_url="https://api.keywordsai.co/api/",
  api_key=os.getenv("KEYWORDSAI_API_KEY"),
)

response = client.chat.completions.create(
    model="gpt-4o-mini",  # This will be overridden by prompt config
    messages=[{"role": "user", "content": "placeholder"}],  # This will be overridden
    extra_body={
      "prompt": {
        "prompt_id": "1d855daae9bd471091a17d11f5fdad31",
        "variables": {
            "emailData": "",
            "currentYear": "",
            "twitterData": "",
            "calendarData": "",
            "currentMonth": "",
            "currentDateString": "",
            "twitterTimelineData": ""
        },
        "override": True
      }
    }
)

print(response.choices[0].message.content)