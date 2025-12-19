{
  "id": "J427",
  "title": "多條件薪資計算",
  "difficulty": "Hard",
  "description": "輸入時數 h，<=40 每小時120，否則超時部分150。",
  "testCases": [
    { "input": "50", "expected": "6300" }
  ],
  "answerCode": {
    "java": "import java.util.*; public class Main{ public static void main(String[]a){ Scanner sc=new Scanner(System.in); int h=sc.nextInt(); if(h<=40)System.out.print(h*120); else System.out.print(40*120 + (h-40)*150); }}"
  }
}
