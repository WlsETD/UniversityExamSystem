import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        switch (s){
            case "A":
                System.out.print("Excellent");
                break;
            case "B":
                System.out.print("Good");
                break;
            case "C":
                System.out.print("Average");
                break;
            case "D":
                System.out.print("Poor");
                break;
            default:
                System.out.print("Fail");
        }
    }
}
