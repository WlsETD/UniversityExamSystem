import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n % 2 == 0 && n >= 10 && n <= 20)
            System.out.print("Yes");
        else
            System.out.print("No");
    }
}
