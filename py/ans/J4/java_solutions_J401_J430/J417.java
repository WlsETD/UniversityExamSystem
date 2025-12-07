import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        char c = sc.next().charAt(0);
        if (c >= 'A' && c <= 'Z')
            System.out.print("Upper");
        else if (c >= 'a' && c <= 'z')
            System.out.print("Lower");
        else
            System.out.print("Other");
    }
}
