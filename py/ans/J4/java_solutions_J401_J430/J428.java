import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        boolean hasDigit = false;
        for (char c : s.toCharArray()){
            if (Character.isDigit(c)){
                hasDigit = true;
            }
        }
        if (s.length() >= 8 && hasDigit)
            System.out.print("OK");
        else
            System.out.print("NG");
    }
}
