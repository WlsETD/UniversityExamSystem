import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        char c = sc.next().charAt(0);
        if ("aeiouAEIOU".indexOf(c) >= 0)
            System.out.print("Vowel");
        else
            System.out.print("Consonant");
    }
}
